import { z } from "zod";

export const collectionSchema = z
	.object({
		name: z
			.string()
			.trim()
			.min(1, "Name is required")
			.max(60, "Name is too long"),
		type: z.enum(["parent", "child"]),
		parent: z.string().trim().toLowerCase().optional().default(""),
		order: z.coerce.number().int().min(0).default(0),
		showInNav: z.boolean().default(false),
		isSale: z.boolean().default(false),
		isActive: z.boolean().default(true),
	})
	.superRefine((data, ctx) => {
		if (data.type === "child" && !data.parent) {
			ctx.addIssue({
				code: "custom",
				path: ["parent"],
				message: "Child collection ke liye parent select karein",
			});
		}
		if (data.type === "parent" && data.parent) {
			ctx.addIssue({
				code: "custom",
				path: ["parent"],
				message: "Parent collection ka parent nahi ho sakta",
			});
		}
		if (data.type === "child" && data.isSale) {
			ctx.addIssue({
				code: "custom",
				path: ["isSale"],
				message: "Sale sirf parent collection ho sakti hai",
			});
		}
	});
