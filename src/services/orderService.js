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
	if (quote.items.length === 0) throw new AppError("Cart khali hai", 400);

	// Koi bhi line ok na ho to order nahi banega, user ko cart update karne ko kahenge
	const problem = quote.items.find((l) => l.status !== "ok");
	if (problem) {
		throw new AppError(
			`${problem.name}: ${problem.message ?? "stock badal gaya hai, cart update karein"}`,
			409,
		);
	}

	const settings = await getSettings();
	const rate = settings.pkrPerUsd;
	if (!rate) {
		throw new AppError(
			"Exchange rate set nahi hai, admin settings check karein",
			500,
		);
	}

	const lines = [];
	let chargedUsdCents = 0;

	for (const l of quote.items) {
		const unit = toCents(l.price, rate);
		lines.push({
			quantity: l.qty,
			price_data: {
				currency: "usd",
				unit_amount: unit,
				product_data: {
					name: l.variant ? `${l.name} (${l.variant})` : l.name,
					images: l.image ? [l.image] : [],
				},
			},
		});
		chargedUsdCents += unit * l.qty;

		if (l.expressFee > 0) {
			const fee = toCents(l.expressFee, rate);
			lines.push({
				quantity: 1,
				price_data: {
					currency: "usd",
					unit_amount: fee,
					product_data: { name: `Express shipping: ${l.name}` },
				},
			});
			chargedUsdCents += fee;
		}
	}

	const order = await Order.create({
		orderNumber: makeOrderNumber(),
		user: userId,
		email,
		phone,
		shipping: { name, address, city, postalCode, country },
		items: quote.items.map((l) => ({
			productId: l.productId,
			name: l.name,
			slug: l.slug,
			image: l.image,
			sku: l.sku,
			variant: l.variant,
			attributes: l.attributes,
			qty: l.qty,
			price: l.price,
			express: l.express,
			expressFee: l.expressFee,
			choices: l.choices,
		})),
		subtotal: quote.subtotal,
		expressTotal: quote.expressTotal,
		total: quote.total,
		pkrPerUsd: rate,
		chargedUsdCents,
		statusHistory: [
			{ status: "pending_payment", note: "Order created", at: new Date() },
		],
	});

	const site = process.env.NEXT_PUBLIC_SITE_URL;
	const session = await getStripe().checkout.sessions.create({
		mode: "payment",
		customer_email: email,
		client_reference_id: String(order._id),
		metadata: { orderId: String(order._id) },
		line_items: lines,
		success_url: `${site}/orders/${order._id}?paid=1`,
		cancel_url: `${site}/checkout?cancelled=1`,
	});

	order.payment.sessionId = session.id;
	await order.save();

	return { orderId: String(order._id), url: session.url };
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
