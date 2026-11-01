// src/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
	{
		firstName: { type: String, required: true, trim: true },
		lastName: { type: String, required: true, trim: true },

		email: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true,
		},

		// Plain password kabhi save nahi hota, sirf bcrypt ka hash
		passwordHash: { type: String, required: true, select: false },

		role: {
			type: String,
			enum: ["customer", "admin"],
			default: "customer",
		},

		// Forgot password ke liye (email wala 6-digit code)
		resetCodeHash: { type: String, select: false },
		resetCodeExpiresAt: { type: Date, select: false },
		resetAttempts: { type: Number, default: 0, select: false },
	},
	{ timestamps: true },
);

// Response mein sensitive fields kabhi na jayein
userSchema.set("toJSON", {
	transform: (_doc, ret) => {
		delete ret.passwordHash;
		delete ret.resetCodeHash;
		delete ret.resetCodeExpiresAt;
		delete ret.resetAttempts;
		delete ret.__v;
		return ret;
	},
});

const User =
	mongoose.models.sillhoutteUser ||
	mongoose.model("sillhoutteUser", userSchema);

export default User;
