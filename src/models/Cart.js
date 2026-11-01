import mongoose from "mongoose";

const attributeSchema = new mongoose.Schema(
	{
		name: { type: String, required: true },
		value: { type: String, required: true },
	},
	{ _id: false },
);

const choiceSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		value: { type: String, required: true },
	},
	{ _id: false },
);

const cartItemSchema = new mongoose.Schema(
	{
		productId: { type: mongoose.Schema.Types.ObjectId, required: true },
		attributes: { type: [attributeSchema], default: [] },
		qty: { type: Number, required: true, min: 1 },
		express: { type: Boolean, default: false },
		choices: { type: [choiceSchema], default: [] },
	},
	{ _id: false },
);

const cartSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			required: true,
			unique: true,
		},
		items: { type: [cartItemSchema], default: [] },
	},
	{ timestamps: true },
);

const Cart =
	mongoose.models.sillhouetteCart ||
	mongoose.model("sillhouetteCart", cartSchema);

export default Cart;
