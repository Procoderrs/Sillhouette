import { z } from "zod";

const viewAllStyle = z.enum(["primary", "sale"], {
	message: "Style must be primary or sale",
});

const title = z.string().trim().min(1, "Title is required").max(80);
const collection = z.string().trim().min(1, "Collection is required");

// Create ke liye defaults hain
export const homeSectionCreateSchema = z.object({
	title,
	collection,
	showViewAll: z.boolean().default(true),
	viewAllStyle: viewAllStyle.default("primary"),
	order: z.coerce.number().int().min(0).default(0),
	isActive: z.boolean().default(true),
});

// Update mein defaults nahi hone chahiye, warna PATCH mein missing fields reset ho jayengi
export const homeSectionUpdateSchema = z.object({
	title: title.optional(),
	collection: collection.optional(),
	showViewAll: z.boolean().optional(),
	viewAllStyle: viewAllStyle.optional(),
	order: z.coerce.number().int().min(0).optional(),
	isActive: z.boolean().optional(),
});
