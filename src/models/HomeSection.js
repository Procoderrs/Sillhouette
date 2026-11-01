import mongoose from "mongoose";

const homeSectionSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		collection: { type: String, required: true, trim: true, lowercase: true },
		showViewAll: { type: Boolean, default: true },
		viewAllStyle: {
			type: String,
			enum: ["primary", "sale"],
			default: "primary",
		},
		order: { type: Number, default: 0, index: true },
		isActive: { type: Boolean, default: true, index: true },
	},
	{ timestamps: true },
);

const HomeSection =
	mongoose.models.sillhouetteHomeSection ||
	mongoose.model("sillhouetteHomeSection", homeSectionSchema);

export default HomeSection;
