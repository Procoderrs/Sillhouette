import Order from "@/models/Order";
import Product from "@/models/Product";
import Cart from "@/models/Cart";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getStripe } from "@/lib/stripe";
import { quoteCart } from "@/services/cartService";
import { getSettings } from "@/services/settingService";
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

	const order = await Order.create({
		orderNumber: makeOrderNumber(),
		user: userId || undefined,
		email,
		phone,
		shipping: { name, address, city, postalCode, country },
		items: quote.items.map((l) => ({
			productId: l.productId,
			name: l.name,
			variant: l.variant,
			image: l.image,
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
			payment_method_types: ["card"],
			receipt_email: email,
			metadata: { orderId: String(order._id) },
		},
		{ idempotencyKey: `order-${order._id}` },
	);

	order.payment = { provider: "stripe", paymentIntentId: intent.id };
	await order.save();

	return { orderId: String(order._id), clientSecret: intent.client_secret };
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
			note = "Payment received. Variant nahi mila, stock manually check karein";
			continue;
		}

		// Stock sirf tab kam hoga jab kafi ho, race condition se bachne ke liye
		const res = await Product.updateOne(
			{ _id: item.productId, [`variants.${idx}.stock`]: { $gte: item.qty } },
			{ $inc: { [`variants.${idx}.stock`]: -item.qty } },
		);
		if (res.modifiedCount === 0) {
			note = "Payment received. Stock kam pad gaya, order review karein";
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
