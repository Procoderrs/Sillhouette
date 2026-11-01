import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
	{
		key: { type: String, default: "store", unique: true },
		whatsappNumber: { type: String, default: "" },
		bookingPhone: { type: String, default: "" },
		supportEmail: { type: String, default: "" },
		expressFee: { type: Number, default: 8000, min: 0 },
		expressDays: { type: String, default: "5-6 working days" },
		shippingNote: { type: String, default: "Shipping calculated at checkout." },
		instagram: { type: String, default: "" },
		facebook: { type: String, default: "" },
		youtube: { type: String, default: "" },
		tiktok: { type: String, default: "" },
		footerNote: { type: String, default: "" },
		pkrPerUsd: { type: Number, default: 280, min: 1 },
	},
	{ timestamps: true },
);

const Settings =
	mongoose.models.sillhouetteSettings ||
	mongoose.model("sillhouetteSettings", settingsSchema);

export default Settings;
