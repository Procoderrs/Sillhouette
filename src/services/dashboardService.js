import Order from "@/models/Order";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { connectDB } from "@/lib/db";

const SOLD_STATUSES = ["paid", "processing", "shipped", "delivered"];
const LOW_STOCK = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;
const TZ = "Asia/Karachi";

// Pakistan ke time ke hisaab se aaj ka shuru (midnight, UTC instant mein)
function startOfTodayPKT() {
	const pkt = new Date(Date.now() + PKT_OFFSET_MS);
	pkt.setUTCHours(0, 0, 0, 0);
	return new Date(pkt.getTime() - PKT_OFFSET_MS);
}

export async function getDashboardData() {
	await connectDB();

	const todayStart = startOfTodayPKT();
	const weekStart = new Date(todayStart.getTime() - 6 * DAY_MS);

	const [
		statusRows,
		todayOrders,
		dailyRows,
		productRows,
		lowStock,
		reviewRows,
		recent,
	] = await Promise.all([
		Order.aggregate([
			{
				$group: {
					_id: "$status",
					count: { $sum: 1 },
					total: { $sum: "$total" },
				},
			},
		]),
		Order.countDocuments({ createdAt: { $gte: todayStart } }),
		Order.aggregate([
			{
				$match: {
					createdAt: { $gte: weekStart },
					status: { $in: SOLD_STATUSES },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: {
							format: "%Y-%m-%d",
							date: "$createdAt",
							timezone: TZ,
						},
					},
					total: { $sum: "$total" },
					count: { $sum: 1 },
				},
			},
		]),
		Product.aggregate([{ $group: { _id: "$isActive", count: { $sum: 1 } } }]),
		Product.aggregate([
			{ $unwind: "$variants" },
			{ $match: { "variants.stock": { $lte: LOW_STOCK } } },
			{
				$project: {
					name: 1,
					slug: 1,
					sku: "$variants.sku",
					stock: "$variants.stock",
				},
			},
			{ $sort: { stock: 1 } },
			{ $limit: 10 },
		]),
		Review.aggregate([
			{ $group: { _id: null, count: { $sum: 1 }, avg: { $avg: "$rating" } } },
		]),
		Order.find({})
			.sort({ createdAt: -1 })
			.limit(6)
			.select("orderNumber shipping total status createdAt")
			.lean(),
	]);

	// Status ke hisaab se counts aur paid revenue
	const statusCounts = {};
	let revenue = 0;
	let soldOrders = 0;
	for (const row of statusRows) {
		statusCounts[row._id] = row.count;
		if (SOLD_STATUSES.includes(row._id)) {
			revenue += row.total;
			soldOrders += row.count;
		}
	}

	// Pichle 7 din (aaj sameit), har din ka revenue
	const dailyMap = new Map(dailyRows.map((r) => [r._id, r]));
	const days = [];
	for (let i = 0; i < 7; i++) {
		const d = new Date(weekStart.getTime() + i * DAY_MS);
		const key = new Date(d.getTime() + PKT_OFFSET_MS)
			.toISOString()
			.slice(0, 10);
		const row = dailyMap.get(key);
		days.push({ date: key, total: row?.total ?? 0, count: row?.count ?? 0 });
	}

	const products = { active: 0, inactive: 0 };
	for (const r of productRows) {
		if (r._id) products.active = r.count;
		else products.inactive = r.count;
	}

	const reviews = reviewRows[0] ?? { count: 0, avg: 0 };

	return {
		revenue,
		soldOrders,
		todayOrders,
		statusCounts,
		products,
		days,
		lowStock,
		reviews: { count: reviews.count, avg: reviews.avg ?? 0 },
		recentOrders: recent,
	};
}
