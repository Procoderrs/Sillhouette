import Product from "@/models/Product";
import { connectDB } from "@/lib/db";

const FIELDS =
	"name slug images minPrice maxPrice minSalePrice onSale collection avgRating reviewCount";

// Same collection ke active products pehle, phir zarurat ho to baaki products se bharen
export async function getSimilarProducts(product, limit = 8) {
	await connectDB();

	const sameCollection = await Product.find({
		isActive: true,
		collection: product.collection,
		_id: { $ne: product._id },
	})
		.sort({ createdAt: -1 })
		.limit(limit)
		.select(FIELDS)
		.lean();

	if (sameCollection.length >= limit) return sameCollection;

	const excludeIds = [product._id, ...sameCollection.map((p) => p._id)];
	const others = await Product.find({
		isActive: true,
		_id: { $nin: excludeIds },
	})
		.sort({ createdAt: -1 })
		.limit(limit - sameCollection.length)
		.select(FIELDS)
		.lean();

	return [...sameCollection, ...others];
}
