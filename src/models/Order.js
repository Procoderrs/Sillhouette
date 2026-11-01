import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
	{ name: String, value: String },
	{ _id: false },
);

const orderItemSchema = new mongoose.Schema(
	{
		productId: { type: mongoose.Schema.Types.ObjectId, required: true },
		name: String,
		slug: String,
		image: String,
		sku: String,
		variant: String,
		attributes: { type: [attributeSchema], default: [] },
		qty: { type: Number, required: true },
		price: { type: Number, required: true },
		express: { type: Boolean, default: false },
		expressFee: { type: Number, default: 0 },
		choices: {
			type: [{ title: String, value: String, _id: false }],
			default: [],
		},
	},
	{ _id: false },
);

const orderSchema = new mongoose.Schema(
	{
		orderNumber: { type: String, required: true, unique: true },
		user: { type: mongoose.Schema.Types.ObjectId, default: null, index: true },
		email: { type: String, required: true },
		phone: { type: String, required: true },
		shipping: {
			name: String,
			address: String,
			city: String,
			postalCode: { type: String, default: "" },
			country: String,
		},
		items: { type: [orderItemSchema], default: [] },
		subtotal: { type: Number, required: true },
		expressTotal: { type: Number, default: 0 },
		total: { type: Number, required: true },
		pkrPerUsd: { type: Number, required: true },
		chargedUsdCents: { type: Number, required: true },
		status: {
			type: String,
			enum: [
				"pending_payment",
				"paid",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
				"payment_failed",
			],
			default: "pending_payment",
			index: true,
		},
		payment: {
			provider: { type: String, default: "stripe" },
			sessionId: { type: String, default: "" },
			paymentIntentId: { type: String, default: "" },
		},
		statusHistory: {
			type: [{ status: String, note: String, at: Date, _id: false }],
			default: [],
		},
	},
	{ timestamps: true },
);

const Order =
	mongoose.models.sillhouetteOrder ||
	mongoose.model("sillhouetteOrder", orderSchema);

export default Order;
