import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { MAX_QTY } from "@/validators/cartSchema";
import { getSettings } from "@/services/settingService";

function attrKey(attrs = []) {
	return [...attrs]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((a) => `${a.name}=${a.value}`)
		.join("|");
}

// Ek line ki pehchaan: product + variant
function keyOf(item) {
	return `${item.productId}|${attrKey(item.attributes)}`;
}

// Same line dobara aaye to quantity jama, aur max se zyada nahi
function combine(list) {
	const map = new Map();
	for (const item of list) {
		const key = keyOf(item);
		const prev = map.get(key);
		const qty = Math.min((prev?.qty ?? 0) + item.qty, MAX_QTY);
		map.set(key, { ...item, qty });
	}
	return [...map.values()];
}

function toPlain(i) {
	return {
		productId: String(i.productId),
		attributes: i.attributes.map(({ name, value }) => ({ name, value })),
		qty: i.qty,
		express: i.express,
		choices: i.choices.map(({ title, value }) => ({ title, value })),
	};
}

function unavailable(item, message) {
	return {
		...item,
		status: "unavailable",
		message,
		qty: 0,
		price: 0,
		expressFee: 0,
	};
}

// Database se price, stock aur status nikalna. Client ki price kabhi use nahi hogi.
export async function quoteCart(list) {
	await connectDB();
	const items = combine(list);
	const settings = await getSettings();

	const ids = [...new Set(items.map((i) => i.productId))];
	const products = await Product.find({
		_id: { $in: ids },
		isActive: true,
	}).lean();
	const byId = new Map(products.map((p) => [String(p._id), p]));

	const lines = items.map((item) => {
		const product = byId.get(item.productId);
		if (!product) return unavailable(item, "Ye product ab available nahi hai");

		const variant = product.variants.find(
			(v) => attrKey(v.attributes) === attrKey(item.attributes),
		);
		if (!variant) return unavailable(item, "Ye option ab available nahi hai");

		// Sale price tab jab product sale par ho
		const price =
			product.onSale && variant.salePrice != null
				? variant.salePrice
				: variant.price;
		const stock = variant.stock;

		let status = "ok";
		let qty = Math.min(item.qty, stock);
		if (stock === 0) {
			status = "out_of_stock";
			qty = 0;
		} else if (qty < item.qty) {
			status = "limited";
		}

		return {
			...item,
			name: product.name,
			slug: product.slug,
			image: product.images?.[0] ?? "",
			sku: variant.sku,
			variant: variant.attributes.map((a) => a.value).join(" / "),
			price,
			regularPrice: variant.price,
			stock,
			qty,
			status,
			expressFee: item.express ? settings.expressFee : 0,
		};
	});

	const counted = lines.filter(
		(l) => l.status === "ok" || l.status === "limited",
	);
	const subtotal = counted.reduce((sum, l) => sum + l.price * l.qty, 0);
	const expressTotal = counted.reduce((sum, l) => sum + l.expressFee, 0);

	return {
		items: lines,
		subtotal,
		expressTotal,
		total: subtotal + expressTotal,
	};
}

export async function getServerItems(userId) {
	await connectDB();
	const cart = await Cart.findOne({ user: userId }).lean();
	return cart ? cart.items.map(toPlain) : [];
}

export async function saveServerItems(userId, list) {
	await connectDB();
	const items = combine(list);
	await Cart.findOneAndUpdate(
		{ user: userId },
		{ $set: { items } },
		{ upsert: true, new: true },
	);
	return items;
}

// Guest cart ko server cart mein mila dena
export async function mergeServerItems(userId, guestItems) {
	const serverItems = await getServerItems(userId);
	return saveServerItems(userId, [...serverItems, ...guestItems]);
}
