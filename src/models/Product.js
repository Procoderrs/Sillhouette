import mongoose from "mongoose";

const choiceGroupSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		choices: {
			type: [String],
			validate: [(v) => v.length > 0, "At least one choice is required"],
		},
	},

	{ _id: false },
);
const attributeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		value: { type: String, required: true, trim: true },
	},
	{ _id: false },
);

const variantSchema = new mongoose.Schema({
	attributes: { type: [attributeSchema], default: [] },
	sku: { type: String, required: true, trim: true, uppercase: true },
	price: { type: Number, required: true, min: 1 },
	salePrice: { type: Number, min: 1, default: null },
	stock: { type: Number, min: 0, default: 0 },
});

const optionSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		useInSku: { type: Boolean, default: false },
		values: {
			type: [String],
			validate: [(v) => v.length > 0, "Option needs at least one value"],
		},
	},
	{ _id: false },
);

const productSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		slug: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},
		sku: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		choiceGroups: { type: [choiceGroupSchema], default: [] },
		description: { type: String, default: "" },
		collection: { type: String, required: true, index: true },
		childCollection: { type: String, default: "" },
		color: { type: String, default: "" },
		style: { type: String, default: "" },
		images: {
			type: [String],
			default: [],
			validate: [(v) => v.length <= 5, "Maximum 5 images"],
		},
		sizeChartImage: { type: String, default: "" },
		unstitchedDetails: { type: String, default: "" },
		readyMadeDetails: { type: String, default: "" },
		onSale: { type: Boolean, default: false, index: true },
		saleNote: { type: String, default: "" },
		isNew: { type: Boolean, default: false },
		isActive: { type: Boolean, default: true, index: true },
		expressAllowed: { type: Boolean, default: true },
		options: { type: [optionSchema], default: [] },
		variants: {
			type: [variantSchema],
			validate: [(v) => v.length > 0, "At least one variant is required"],
		},
		minPrice: { type: Number, index: true },
		maxPrice: { type: Number },
		minSalePrice: { type: Number, default: null, index: true },
	},
	{ timestamps: true },
);

// Listing ke liye min/max prices har save par khud calculate hon
productSchema.pre("validate", function () {
	const prices = this.variants.map((v) => v.price);
	this.minPrice = Math.min(...prices);
	this.maxPrice = Math.max(...prices);

	const salePrices = this.variants
		.map((v) => v.salePrice)
		.filter((n) => n !== null && n !== undefined);

	this.minSalePrice =
		this.onSale && salePrices.length ? Math.min(...salePrices) : null;
});

const Product =
	mongoose.models.sillhouetteProduct ||
	mongoose.model("sillhouetteProduct", productSchema);

export default Product;
