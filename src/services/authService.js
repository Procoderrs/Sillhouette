// src/services/authService.js
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetCodeEmail } from "@/lib/email";
const SALT_ROUNDS = 10;

const RESET_CODE_TTL_MS = 10 * 60 * 1000; // 10 minute
const MAX_RESET_ATTEMPTS = 5;
const INVALID_RESET = "Invalid or expired reset code";

// Code ko plain text mein save nahi karte, sirf hash
function hashCode(code) {
	return crypto.createHash("sha256").update(code).digest("hex");
}

export async function requestPasswordReset({ email }) {
	await connectDB();

	const normalizedEmail = email.trim().toLowerCase();
	const user = await User.findOne({ email: normalizedEmail }).lean();

	// User na ho to kuch nahi karna, controller same response dega
	if (!user) return;

	const code = crypto.randomInt(100000, 1000000).toString();

	// updateOne se sirf reset fields badlenge, password validation nahi chalegi
	await User.updateOne(
		{ _id: user._id },
		{
			$set: {
				resetCodeHash: hashCode(code),
				resetCodeExpiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
				resetAttempts: 0,
			},
		},
	);

	await sendResetCodeEmail({ to: user.email, code });
}

export async function resetPassword({ email, code, newPassword }) {
	await connectDB();

	const normalizedEmail = email.trim().toLowerCase();
	const user = await User.findOne({ email: normalizedEmail }).select(
		"+resetCodeHash +resetCodeExpiresAt +resetAttempts",
	);

	if (!user || !user.resetCodeHash || !user.resetCodeExpiresAt) {
		throw new AppError(INVALID_RESET, 400);
	}

	if (user.resetCodeExpiresAt < new Date()) {
		throw new AppError("Reset code has expired. Please request a new one", 400);
	}

	if (user.resetAttempts >= MAX_RESET_ATTEMPTS) {
		throw new AppError("Too many attempts. Please request a new code", 429);
	}

	const isMatch = crypto.timingSafeEqual(
		Buffer.from(hashCode(code)),
		Buffer.from(user.resetCodeHash),
	);

	if (!isMatch) {
		await User.updateOne({ _id: user._id }, { $inc: { resetAttempts: 1 } });
		throw new AppError(INVALID_RESET, 400);
	}

	const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

	// Password badlne ke baad reset fields hata dein, taake code dobara na chal sake
	await User.updateOne(
		{ _id: user._id },
		{
			$set: { passwordHash },
			$unset: { resetCodeHash: 1, resetCodeExpiresAt: 1, resetAttempts: 1 },
		},
	);
}
// Login mein user na mile to bhi bcrypt chalana, taake response ka time
// dekh kar koi ye andaza na laga sake ke email exist karti hai ya nahi
const DUMMY_HASH = bcrypt.hashSync("dummy-password", SALT_ROUNDS);

const INVALID_LOGIN = "Email ya password galat hai";

export async function registerUser({ firstName, lastName, email, password }) {
	await connectDB();

	const normalizedEmail = email.trim().toLowerCase();

	// 1. Email pehle se to nahi
	const existing = await User.findOne({ email: normalizedEmail }).lean();
	if (existing) {
		throw new AppError("Is email se account pehle se bana hua hai", 409);
	}

	// 2. Password hash karna
	const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

	// 3. User save karna
	try {
		const user = await User.create({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
			email: normalizedEmail,
			passwordHash,
		});
		return user; // JSON banate waqt passwordHash khud hat jata hai
	} catch (error) {
		// Do requests ek saath aayein to findOne dono ko pass kar sakta hai.
		// Unique index ye duplicate pakad leta hai.
		if (error.code === 11000) {
			throw new AppError("Is email se account pehle se bana hua hai", 409);
		}
		throw error;
	}
}

export async function loginUser({ email, password }) {
	await connectDB();

	const normalizedEmail = email.trim().toLowerCase();

	// passwordHash by default select nahi hota, is liye explicitly mangwaya
	const user = await User.findOne({ email: normalizedEmail }).select(
		"+passwordHash",
	);

	if (!user) {
		await bcrypt.compare(password, DUMMY_HASH);
		throw new AppError(INVALID_LOGIN, 401);
	}

	const isMatch = await bcrypt.compare(password, user.passwordHash);
	if (!isMatch) {
		throw new AppError(INVALID_LOGIN, 401);
	}

	return user;
}

export async function getUserById(id) {
	await connectDB();

	const user = await User.findById(id);
	if (!user) {
		throw new AppError("User not found", 404);
	}
	return user;
}
