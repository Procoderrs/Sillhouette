import { z } from "zod";

export const reviewSchema = z.object({
	rating: z.coerce.number().int().min(1, "Please select a rating").max(5),
	title: z.string().trim().max(120).optional().default(""),
	comment: z
		.string()
		.trim()
		.min(10, "Comment must be at least 10 characters")
		.max(1000, "Comment is too long"),
	displayName: z.string().trim().max(60).optional().default(""),
	images: z.array(z.string().url()).max(3).optional().default([]),
});
