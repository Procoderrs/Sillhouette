import { z } from "zod";

const optionalUrl = z
	.string()
	.trim()
	.url("Enter a full URL, e.g. https://instagram.com/yourpage")
	.or(z.literal(""));

export const settingsSchema = z.object({
	whatsappNumber: z
		.string()
		.trim()
		.regex(/^\d{10,15}$/, "Digits only, with country code (e.g. 923001234567)")
		.or(z.literal("")),
	bookingPhone: z.string().trim().max(60),
	supportEmail: z.string().trim().email("Invalid email").or(z.literal("")),
	expressFee: z.coerce
		.number()
		.int("Must be a whole number")
		.min(0, "Cannot be negative"),
	expressDays: z.string().trim().min(1, "Required").max(40),
	shippingNote: z.string().trim().max(200),
	instagram: optionalUrl,
	facebook: optionalUrl,
	youtube: optionalUrl,
	tiktok: optionalUrl,
	footerNote: z.string().trim().max(300),
	pkrPerUsd: z.coerce.number().positive("Rate must be positive"),
});
