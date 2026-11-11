import mongoose from "mongoose";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { getUserById } from "@/services/authService";

// Product ka average rating aur count dobara calculate karein
async function refreshRatingSummary(productId) {
	const [agg] = await Review.aggregate([
		{ $match: { product: new mongoose.Types.ObjectId(productId) } },
		{ $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
	]);

	await Product.updateOne(
		{ _id: productId },
		{
			$set: {
				avgRating: agg ? Math.round(agg.avg * 10) / 10 : 0,
				reviewCount: agg?.count ?? 0,
			},
		},
	);
}

export async function listReviews(productId, { page = 1, limit = 10 } = {}) {
	await connectDB();
	if (!mongoose.isValidObjectId(productId)) return [];

	return Review.find({ product: productId })
		.sort({ createdAt: -1 })
		.skip((page - 1) * limit)
		.limit(limit)
		.lean();
}

export async function createReview({
	productId,
	userId,
	displayName,
	rating,
	title,
	comment,
	images = [],
}) {
	await connectDB();
	if (!mongoose.isValidObjectId(productId)) {
		throw new AppError("Product not found", 404);
	}

	const product = await Product.findOne({ _id: productId, isActive: true })
		.select("_id")
		.lean();
	console.log("REVIEW_PRODUCT_LOOKUP:", {
		productId,
		found: Boolean(product),
	});
	if (!product) throw new AppError("Product not found", 404);

	// Logged-in user ka naam account se. Guest ka naam jo likha ho, warna "Anonymous".
	let name = "Anonymous";
	if (userId) {
		const user = await getUserById(userId);
		if (user) {
			const lastInitial = user.lastName ? ` ${user.lastName.charAt(0)}.` : "";
			name = `${user.firstName}${lastInitial}`;
		}
	} else if (displayName?.trim()) {
		name = displayName.trim().slice(0, 60);
	}

	try {
		const review = await Review.create({
			product: productId,
			user: userId || null,
			displayName: name,
			rating,
			title,
			comment,
			images,
		});
		await refreshRatingSummary(productId);
		return review;
	} catch (err) {
		if (err?.code === 11000) {
			throw new AppError("You have already reviewed this product", 409);
		}
		throw err;
	}
}

// Admin: review delete karein
export async function deleteReview(reviewId) {
	await connectDB();
	if (!mongoose.isValidObjectId(reviewId)) {
		throw new AppError("Invalid review id", 400);
	}

	const review = await Review.findByIdAndDelete(reviewId);
	if (!review) throw new AppError("Review not found", 404);

	await refreshRatingSummary(review.product);
	return review;
}
