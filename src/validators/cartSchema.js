import { z } from "zod";

export const MAX_QTY = 20;

const itemSchema = z.object({
	productId: z.string().regex(/^[a-f\d]{24}$/i, "Invalid product id"),
	attributes: z
		.array(
			z.object({
				name: z.string().trim().min(1),
				value: z.string().trim().min(1),
			}),
		)
		.default([]),
	qty: z.coerce.number().int().min(1).max(MAX_QTY),
	express: z.boolean().default(false),
	choices: z
		.array(
			z.object({
				title: z.string().trim().min(1),
				value: z.string().trim().min(1),
			}),
		)
		.default([]),
});

export const cartItemsSchema = z.object({
	items: z.array(itemSchema).max(50, "Cart mein zyada items hain"),
});
