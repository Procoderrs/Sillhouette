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

	// Logged-in user ka order usi ka hoga. Guest ke liye email se account dhoondein ya banayein.
	let ownerId = userId || null;
	let customer = null;
	if (!userId) {
		customer = await ensureCustomerForOrder({ email, name });
		ownerId = customer.userId;
	}

	// Guest ko payment ke baad order page dikhane ke liye private token
	const accessToken = crypto.randomBytes(24).toString("hex");

	const order = await Order.create({
		orderNumber: makeOrderNumber(),
		user: ownerId || undefined,
		accessToken,
		email,
		phone,
		shipping: { name, address, city, postalCode, country },
		items: quote.items.map((l) => ({
			productId: l.productId,
			name: l.name,
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

	// Emails: fail hon to checkout na ruke
	if (customer?.created) {
		requestPasswordReset({ email: customer.email }).catch((err) =>
			console.error("SET_PASSWORD_EMAIL_ERROR:", err),
		);
	} else if (customer) {
		sendOrderLinkedEmail({
			to: customer.email,
			firstName: customer.firstName,
			orderNumber: order.orderNumber,
		}).catch((err) => console.error("ORDER_LINK_EMAIL_ERROR:", err));
	}

	return {
		orderId: String(order._id),
		clientSecret: intent.client_secret,
		accessToken,
	};
}

// Order page khulne par Stripe se payment status check karta hai (webhook late ho to bhi)
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
// Webhook: payment complete hone par
export async function markOrderPaid(session) {
	await connectDB();

	const orderId = session.metadata?.orderId;
	const order = orderId ? await Order.findById(orderId) : null;
	if (!order) throw new Error(`Order not found for session ${session.id}`);

	// Webhook dobara aaye to dobara kaam na ho
	if (order.status !== "pending_payment") return order;

	let note = "Payment received";

	for (const item of order.items) {
		const product = await Product.findById(item.productId);
		const idx = product?.variants.findIndex(
			(v) => attrKey(v.attributes) === attrKey(item.attributes),
		);

		if (idx === undefined || idx < 0) {
			note =
				"Payment received. Variant not found, please check stock manually.";
			continue;
		}

		// Stock sirf tab kam hoga jab kafi ho, race condition se bachne ke liye
		const res = await Product.updateOne(
			{ _id: item.productId, [`variants.${idx}.stock`]: { $gte: item.qty } },
			{ $inc: { [`variants.${idx}.stock`]: -item.qty } },
		);
		if (res.modifiedCount === 0) {
			note =
				"Payment received. Stock was insufficient, please review the order.";
		}
	}

	order.status = "paid";
	order.payment.paymentIntentId = session.payment_intent ?? "";
	order.statusHistory.push({ status: "paid", note, at: new Date() });
	await order.save();

	// Logged-in user ki server cart khali karein
	if (order.user) {
		await Cart.updateOne({ user: order.user }, { $set: { items: [] } });
	}

	return order;
}

// Webhook: session expire ya payment fail hone par
export async function markOrderFailed(session, status) {
	await connectDB();

	const orderId = session.metadata?.orderId;
	const order = orderId ? await Order.findById(orderId) : null;
	if (!order || order.status !== "pending_payment") return;

	order.status = status;
	order.statusHistory.push({
		status,
		note: status === "cancelled" ? "Checkout expired" : "Payment failed",
		at: new Date(),
	});
	await order.save();
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

export async function updateOrderStatus(id, status, note = "") {
	await connectDB();
	if (!mongoose.isValidObjectId(id))
		throw new AppError("Invalid order id", 400);

	const order = await Order.findById(id);
	if (!order) throw new AppError("Order not found", 404);

	order.status = status;
	order.statusHistory.push({
		status,
		note: note || `Status changed to ${status}`,
		at: new Date(),
	});
	await order.save();
	return order;
}

export async function listOrdersForUser(userId) {
	await connectDB();
	if (!mongoose.isValidObjectId(userId)) return [];
	return Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean();
}
