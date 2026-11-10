import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getStripe } from "@/lib/stripe";
import { quoteCart } from "@/services/cartService";
import { getSettings } from "@/services/settingService";
import crypto from "crypto";
import { ensureCustomerForOrder } from "@/services/customerService";
import { requestPasswordReset } from "@/services/authService";
import { sendOrderLinkedEmail } from "@/lib/orderEmail";
import mongoose from "mongoose";

function attrKey(attrs = []) {
	return [...attrs]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((a) => `${a.name}=${a.value}`)
		.join("|");
}

function toCents(pkr, rate) {
	return Math.round((pkr / rate) * 100);
}

function makeOrderNumber() {
	const time = Date.now().toString(36).toUpperCase();
	const rand = Math.random().toString(36).slice(2, 5).toUpperCase();
	return `SLH-${time}${rand}`;
}

// Called when the order page opens. Checks payment status with Stripe,
// in case the webhook is late.
export async function syncPaymentStatus(orderId) {
	await connectDB();
	if (!mongoose.isValidObjectId(orderId)) return;

	const order = await Order.findById(orderId).lean();
	if (
		!order ||
		order.status !== "pending_payment" ||
		!order.payment?.paymentIntentId
	)
		return;

	try {
		const intent = await getStripe().paymentIntents.retrieve(
			order.payment.paymentIntentId,
		);
		if (intent.status === "succeeded") {
			await markOrderPaid({
				id: intent.id,
				payment_intent: intent.id,
				metadata: intent.metadata,
			});
		}
	} catch (err) {
		console.error("SYNC_PAYMENT_ERROR:", err);
	}
}

export async function getOrderById(id) {
	await connectDB();
	if (!mongoose.isValidObjectId(id)) return null;
	return Order.findById(id).lean();
}

export async function listOrders({ status } = {}) {
	await connectDB();
	const filter = status && status !== "all" ? { status } : {};
	return Order.find(filter).sort({ createdAt: -1 }).limit(200).lean();
}

export async function listOrdersForUser(userId) {
	await connectDB();
	if (!mongoose.isValidObjectId(userId)) return [];
	return Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean();
}

// Stock ko SKU se atomically kam karna. Agar kisi item ka stock kam ho to pehle wale items wapas karke error denge.
async function reserveStock(items) {
	const done = [];
	for (const item of items) {
		if (!item.sku) continue; // Purane items jin mein SKU nahi, unhe skip karein

		const res = await Product.updateOne(
			{
				_id: item.productId,
				variants: { $elemMatch: { sku: item.sku, stock: { $gte: item.qty } } },
			},
			{ $inc: { "variants.$.stock": -item.qty } },
		);

		if (res.modifiedCount === 0) {
			await releaseStock(done);
			throw new AppError(
				`${item.name} is out of stock in this quantity. Please update your cart.`,
				409,
			);
		}
		done.push(item);
	}
}

// Stock wapas karna
async function releaseStock(items) {
	for (const item of items) {
		if (!item.sku) continue;
		await Product.updateOne(
			{ _id: item.productId, variants: { $elemMatch: { sku: item.sku } } },
			{ $inc: { "variants.$.stock": item.qty } },
		);
	}
}

// Order ka reserved stock sirf ek dafa wapas hota hai
async function releaseOrderStock(order) {
	if (!order.stockReserved) return;
	await releaseStock(order.items);
	order.stockReserved = false;
}

export async function createCheckout({
	userId,
	name,
	email,
	phone,
	address,
	city,
	postalCode,
	country,
	items,
}) {
	await connectDB();

	const quote = await quoteCart(items);
	if (quote.items.length === 0) throw new AppError("Your cart is empty", 400);

	const bad = quote.items.find((l) => l.status !== "ok");
	if (bad) {
		throw new AppError(
			`${bad.name} is no longer available in this quantity. Please update your cart.`,
			409,
		);
	}

	const settings = await getSettings();
	const rate = settings.pkrPerUsd;
	if (!rate)
		throw new AppError(
			"Exchange rate is not set. Please check the admin settings.",
			500,
		);

	// Stock abhi reserve karein, taake doosra customer same stock na le sake
	await reserveStock(quote.items);

	let order = null;
	try {
		// A logged-in user's order belongs to that user.
		// For guests, find an existing account by email or create one.
		let ownerId = userId || null;
		let customer = null;
		if (!userId) {
			customer = await ensureCustomerForOrder({ email, name });
			ownerId = customer.userId;
		}

		// Private token so a guest can open the order page after payment
		const accessToken = crypto.randomBytes(24).toString("hex");

		order = await Order.create({
			orderNumber: makeOrderNumber(),
			user: ownerId || undefined,
			accessToken,
			email,
			phone,
			shipping: { name, address, city, postalCode, country },
			items: quote.items.map((l) => ({
				productId: l.productId,
				name: l.name,
				sku: l.sku,
				variant: l.variant,
				image: l.image,
				attributes: l.attributes ?? [],
				qty: l.qty,
				price: l.price,
				express: l.express,
			})),
			subtotal: quote.subtotal,
			expressTotal: quote.expressTotal,
			total: quote.total,
			pkrPerUsd: rate,
			chargedUsdCents: toCents(quote.total, rate),
			status: "pending_payment",
			stockReserved: true,
			statusHistory: [{ status: "pending_payment", note: "Order created" }],
		});

		const intent = await getStripe().paymentIntents.create(
			{
				amount: order.chargedUsdCents,
				currency: "usd",
				automatic_payment_methods: { enabled: true, allow_redirects: "never" },
				receipt_email: email,
				metadata: { orderId: String(order._id) },
			},
			{ idempotencyKey: `order-${order._id}` },
		);

		order.payment = { provider: "stripe", paymentIntentId: intent.id };
		await order.save();

		// Emails are awaited so Vercel does not freeze the function before they are sent.
		// A failed email is logged only; it does not fail the checkout.
		if (customer?.created) {
			try {
				await requestPasswordReset({ email: customer.email });
			} catch (err) {
				console.error("SET_PASSWORD_EMAIL_ERROR:", err);
			}
		} else if (customer) {
			try {
				await sendOrderLinkedEmail({
					to: customer.email,
					firstName: customer.firstName,
					orderNumber: order.orderNumber,
				});
			} catch (err) {
				console.error("ORDER_LINK_EMAIL_ERROR:", err);
			}
		}

		return {
			orderId: String(order._id),
			clientSecret: intent.client_secret,
			accessToken,
		};
	} catch (err) {
		// Agar order ya Stripe mein error aaye to order hata kar reserved stock wapas karein
		if (order) await Order.deleteOne({ _id: order._id });
		await releaseStock(quote.items);
		throw err;
	}
}

// Webhook: called when payment completes
export async function markOrderPaid(session) {
	await connectDB();

	const orderId = session.metadata?.orderId;
	const order = orderId ? await Order.findById(orderId) : null;
	if (!order) throw new Error(`Order not found for session ${session.id}`);

	// Webhook dobara aaye ya order already processed ho to kuch na karein
	if (order.status !== "pending_payment" && order.status !== "cancelled") {
		return order;
	}

	let note = "Payment received";

	// Agar payment cancel ke baad aayi, to stock dobara reserve karne ki koshish karein
	if (order.status === "cancelled") {
		try {
			await reserveStock(order.items);
			order.stockReserved = true;
		} catch {
			note =
				"Payment received after cancellation. Stock is insufficient, please review the order.";
		}
	}

	order.status = "paid";
	order.payment.paymentIntentId = session.payment_intent ?? "";
	order.statusHistory.push({ status: "paid", note, at: new Date() });
	await order.save();

	// Empty the server cart of the logged-in user
	if (order.user) {
		await Cart.updateOne({ user: order.user }, { $set: { items: [] } });
	}

	return order;
}

// Webhook: called when a card attempt fails or checkout expires
export async function markOrderFailed(session, status) {
	await connectDB();

	const orderId = session.metadata?.orderId;
	const order = orderId ? await Order.findById(orderId) : null;
	if (!order || order.status !== "pending_payment") return;

	// A failed card attempt keeps the order pending, so the customer can try again
	if (status === "payment_failed") {
		order.statusHistory.push({
			status: "pending_payment",
			note: "Card payment failed. Customer can try again.",
			at: new Date(),
		});
		await order.save();
		return;
	}

	// Checkout expired: cancel the order and release the reserved stock
	await releaseOrderStock(order);
	order.status = "cancelled";
	order.statusHistory.push({
		status: "cancelled",
		note: "Checkout expired. Stock released.",
		at: new Date(),
	});
	await order.save();
}

export async function updateOrderStatus(id, status, note = "") {
	await connectDB();
	if (!mongoose.isValidObjectId(id))
		throw new AppError("Invalid order id", 400);

	const order = await Order.findById(id);
	if (!order) throw new AppError("Order not found", 404);

	// Admin ke cancel karne par reserved stock wapas
	if (status === "cancelled") await releaseOrderStock(order);

	order.status = status;
	order.statusHistory.push({
		status,
		note: note || `Status changed to ${status}`,
		at: new Date(),
	});
	await order.save();
	return order;
}
