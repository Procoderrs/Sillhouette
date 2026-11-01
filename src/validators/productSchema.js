import { z } from "zod";

const optionalPrice = z.preprocess(
	(v) => (v === "" || v === null || v === undefined ? null : Number(v)),
	z.number().positive("Sale price must be positive").nullable(),
);

const attributeSchema = z.object({
	name: z.string().trim().min(1),
	value: z.string().trim().min(1),
});

const variantSchema = z.object({
	attributes: z.array(attributeSchema).default([]),
	price: z.coerce.number().int().positive("Price is required"),
	salePrice: optionalPrice,
	stock: z.coerce.number().int().min(0).default(0),
});

const optionSchema = z.object({
	name: z.string().trim().min(1, "Option name is required"),
	useInSku: z.boolean().default(false),
	values: z.array(z.string().trim().min(1)).min(1, "Add at least one value"),
});

export const productSchema = z
	.object({
		name: z.string().trim().min(1, "Name is required").max(120),
		sku: z
			.string()
			.trim()
			.min(1, "SKU is required")
			.transform((s) => s.toUpperCase()),
		description: z.string().trim().default(""),
		collection: z.string().trim().min(1, "Parent category is required"),
		childCollection: z.string().trim().default(""),
		color: z.string().trim().default(""),
		style: z.string().trim().default(""),
		images: z.array(z.string().trim()).max(5, "Maximum 5 images").default([]),
		sizeChartImage: z.string().trim().default(""),
		unstitchedDetails: z.string().default(""),
		readyMadeDetails: z.string().default(""),
		onSale: z.boolean().default(false),
		saleNote: z.string().trim().default(""),
		isNew: z.boolean().default(false),
		isActive: z.boolean().default(true),
		expressAllowed: z.boolean().default(true),
		options: z.array(optionSchema).default([]),
		choiceGroups: z
			.array(
				z.object({
					title: z.string().trim().min(1, "Group title is required"),
					choices: z
						.array(z.string().trim().min(1))
						.min(1, "Each group needs at least one choice"),
				}),
			)
			.default([]),
		variants: z.array(variantSchema).min(1, "Add at least one variant"),
	})
	.superRefine((data, ctx) => {
		// Option names aur values ke duplicates
		const optionNames = new Set();
		data.options.forEach((o, i) => {
			const key = o.name.toLowerCase();
			if (optionNames.has(key)) {
				ctx.addIssue({
					code: "custom",
					path: ["options", i, "name"],
					message: "Option name must be unique",
				});
			}
			optionNames.add(key);

			const values = new Set();
			o.values.forEach((v, j) => {
				const key = v.toLowerCase();
				if (values.has(key)) {
					ctx.addIssue({
						code: "custom",
						path: ["options", i, "values", j],
						message: "Duplicate value in this option",
					});
				}
				values.add(key);
			});
		});

		const combos = new Set();
		data.variants.forEach((v, i) => {
			if (data.options.length === 0) {
				if (v.attributes.length > 0) {
					ctx.addIssue({
						code: "custom",
						path: ["variants", i, "attributes"],
						message: "This product has no options",
					});
				}
			} else {
				// Har option ki ek value zaroori hai
				for (const o of data.options) {
					const attr = v.attributes.find((a) => a.name === o.name);
					if (!attr) {
						ctx.addIssue({
							code: "custom",
							path: ["variants", i, "attributes"],
							message: `Missing option: ${o.name}`,
						});
					} else if (!o.values.includes(attr.value)) {
						ctx.addIssue({
							code: "custom",
							path: ["variants", i, "attributes"],
							message: `Invalid value for ${o.name}`,
						});
					}
				}
			}

			// Ek hi combination do dafa nahi
			const combo = [...v.attributes]
				.sort((a, b) => a.name.localeCompare(b.name))
				.map((a) => `${a.name}=${a.value}`)
				.join("|");
			if (combos.has(combo)) {
				ctx.addIssue({
					code: "custom",
					path: ["variants", i],
					message: "This combination is repeated",
				});
			}
			combos.add(combo);

			if (data.onSale) {
				if (v.salePrice === null) {
					ctx.addIssue({
						code: "custom",
						path: ["variants", i, "salePrice"],
						message: "Sale price is required",
					});
				} else if (v.salePrice >= v.price) {
					ctx.addIssue({
						code: "custom",
						path: ["variants", i, "salePrice"],
						message: "Sale price must be less than price",
					});
				}
			}
		});
	});

export const productQuerySchema = z.object({
	collection: z.string().trim().optional(),
	childCollection: z.string().trim().optional(),
	size: z.string().trim().optional(),
	color: z.string().trim().optional(),
	style: z.string().trim().optional(),
	minPrice: z.coerce.number().min(0).optional(),
	maxPrice: z.coerce.number().min(0).optional(),
	sale: z.enum(["0", "1"]).optional(),
	sort: z.enum(["featured", "price_asc", "price_desc"]).default("featured"),
});
