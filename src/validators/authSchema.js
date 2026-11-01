// src/validators/authSchema.js
import { z } from "zod";

export const registerSchema = z.object({
	firstName: z.string().trim().min(1, "First name zaroori hai").max(50),
	lastName: z.string().trim().min(1, "Last name zaroori hai").max(50),
	email: z.string().trim().email("Sahi email likhein"),
	password: z
		.string()
		.min(8, "Password kam az kam 8 characters ka hona chahiye")
		.max(100),
});

export const loginSchema = z.object({
	email: z.string().trim().email("Sahi email likhein"),
	// Login par sirf khali na hona check karte hain. Minimum length register par hai,
	// taake purane accounts bhi login kar sakein.
	password: z.string().min(1, "Password zaroori hai"),
});

export const forgotPasswordSchema = z.object({
	email: z.string().trim().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
	email: z.string().trim().email("Please enter a valid email"),
	code: z.string().regex(/^\d{6}$/, "Code must be 6 digits"),
	newPassword: z
		.string()
		.min(8, "Password must be at least 8 characters")
		.max(100),
});
