import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "sillhouetteProduct",
			required: true,
			index: true,
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "sillhoutteUser",
			default: null,
		},
		displayName: {
			type: String,
			default: "Anonymous",
			trim: true,
			maxlength: 60,
		},
		rating: { type: Number, required: true, min: 1, max: 5 },
		title: { type: String, default: "", trim: true, maxlength: 120 },
		comment: {
			type: String,
			required: true,
			trim: true,
			minlength: 10,
			maxlength: 1000,
		},
		images: {
			type: [String],
			default: [],
			validate: [(v) => v.length <= 3, "Maximum 3 images"],
		},
	},
	{ timestamps: true },
);

reviewSchema.index({ product: 1, createdAt: -1 });

// Logged-in user ek product par ek hi review de sakta hai (anonymous par ye rule lagu nahi)
reviewSchema.index(
	{ product: 1, user: 1 },
	{ unique: true, partialFilterExpression: { user: { $type: "objectId" } } },
);

const Review =
	mongoose.models.sillhouetteReview ||
	mongoose.model("sillhouetteReview", reviewSchema);

export default Review;
