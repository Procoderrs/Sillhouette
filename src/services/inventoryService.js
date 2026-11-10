import Product from "@/models/Product";
import Order from "@/models/Order";
import { connectDB } from "@/lib/db";
import { expireStalePendingOrders } from "@/services/orderService";
// In statuses ke orders ko "sold" count kiya jayega
const SOLD_STATUSES = ["paid", "processing", "shipped", "delivered"];

export async function getInventory() {
	await connectDB();
	await expireStalePendingOrders();
	const [products, rows] = await Promise.all([
		Product.find({})
			.sort({ name: 1 })
			.select("name slug images variants isActive")
			.lean(),
		Order.aggregate([
			{
				$match: {
					status: { $in: [...SOLD_STATUSES, "pending_payment"] },
				},
			},
			{ $unwind: "$items" },
			{
				$group: {
					_id: { sku: "$items.sku", status: "$status" },
					qty: { $sum: "$items.qty" },
				},
			},
		]),
	]);

	// SKU ke hisaab se sold aur reserved quantity
	const sold = new Map();
	const reserved = new Map();
	for (const r of rows) {
		const sku = r._id.sku;
		if (!sku) continue; // Purane orders mein SKU nahi hai
		if (r._id.status === "pending_payment") {
			reserved.set(sku, (reserved.get(sku) ?? 0) + r.qty);
		} else {
			sold.set(sku, (sold.get(sku) ?? 0) + r.qty);
		}
	}

	return products.map((p) => ({
		_id: String(p._id),
		name: p.name,
		slug: p.slug,
		image: p.images?.[0] ?? "",
		isActive: p.isActive,
		variants: p.variants.map((v) => ({
			sku: v.sku,
			label: v.attributes.map((a) => a.value).join(" / ") || "Default",
			stock: v.stock,
			reserved: reserved.get(v.sku) ?? 0,
			sold: sold.get(v.sku) ?? 0,
		})),
	}));
}
