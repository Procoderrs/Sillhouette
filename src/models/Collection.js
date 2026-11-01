import mongoose from "mongoose";

const collectionSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true, maxlength: 60 },
		slug: {
			type: String,
			required: true,
			lowercase: true,
			trim: true,
		},
		type: { type: String, enum: ["parent", "child"], required: true },

		parent: { type: String, default: "", trim: true, lowercase: true },
		order: { type: Number, default: 0, min: 0 },
		showInNav: { type: Boolean, default: false, index: true },
		isSale: { type: Boolean, default: false, index: true },
		isActive: { type: Boolean, default: true, index: true },
	},
	{ timestamps: true },
);
collectionSchema.index({ parent: 1, slug: 1 }, { unique: true });
const Collection =
	mongoose.models.Collection || mongoose.model("Collection", collectionSchema);

export default Collection;
