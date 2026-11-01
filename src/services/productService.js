import mongoose from "mongoose";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";
import { buildVariantSku } from "@/lib/sku";

function slugify(text) {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base) {
	let slug = base || "product";
	let n = 2;
	while (await Product.exists({ slug })) {
		slug = `${base}-${n}`;
		n++;
	}
	return slug;
}

async function assertSkuAvailable(sku, excludeId) {
	const filter = { sku };
	if (excludeId) filter._id = { $ne: excludeId };

	if (await Product.exists(filter)) {
		throw new AppError("A product with this SKU already exists", 409);
	}
}

// Variant ka SKU server par hamesha isi rule se banega
// Sale price sirf sale ON hone par save hogi
function normalize(input) {
	return {
		...input,
		saleNote: input.onSale ? input.saleNote : "",
		variants: input.variants.map((v) => ({
			attributes: v.attributes,
			sku: buildVariantSku(input.sku, input.options, v.attributes),
			price: v.price,
			salePrice: input.onSale ? v.salePrice : null,
			stock: v.stock,
		})),
	};
}

function mapError(error) {
	if (error?.code === 11000) {
		return new AppError("A product with this SKU or name already exists", 409);
	}
	return error;
}

function assertValidId(id) {
	if (!mongoose.isValidObjectId(id)) {
		throw new AppError("Product not found", 404);
	}
}

export async function createProduct(input) {
	await connectDB();
	await assertSkuAvailable(input.sku);

	const slug = await uniqueSlug(slugify(input.name));

	try {
		const product = await Product.create({ ...normalize(input), slug });
		return product.toJSON();
	} catch (error) {
		throw mapError(error);
	}
}

export async function updateProduct(id, input) {
	await connectDB();
	assertValidId(id);

	const product = await Product.findById(id);
	if (!product) throw new AppError("Product not found", 404);

	await assertSkuAvailable(input.sku, id);

	// Slug kabhi nahi badalta
	product.set(normalize(input));

	try {
		await product.save();
		return product.toJSON();
	} catch (error) {
		throw mapError(error);
	}
}

export async function hideProduct(id) {
	await connectDB();
	assertValidId(id);

	const product = await Product.findByIdAndUpdate(
		id,
		{ $set: { isActive: false } },
		{ new: true },
	).lean();
	if (!product) throw new AppError("Product not found", 404);

	return product;
}

export async function getProductById(id) {
	await connectDB();
	assertValidId(id);

	const product = await Product.findById(id).lean();
	if (!product) throw new AppError("Product not found", 404);

	return product;
}

export async function getProductBySlug(slug, { includeInactive = false } = {}) {
	await connectDB();

	const filter = { slug };
	if (!includeInactive) filter.isActive = true;

	const product = await Product.findOne(filter).lean();
	if (!product) throw new AppError("Product not found", 404);

	return product;
}

export async function listProducts(query, { includeInactive = false } = {}) {
	await connectDB();

	const filter = {};
	if (!includeInactive) filter.isActive = true;
	if (query.collection) filter.collection = query.collection;
	if (query.childCollection) filter.childCollection = query.childCollection;
	if (query.color) filter.color = query.color;
	if (query.style) filter.style = query.style;
	if (query.sale === "1") filter.onSale = true;

	// Ek variant jo sab shartein poori kare, tabhi product aaye
	const conditions = [];
	if (!includeInactive) conditions.push({ stock: { $gt: 0 } });

	if (query.size) {
		conditions.push({
			attributes: { $elemMatch: { name: "Size", value: query.size } },
		});
	}

	if (query.minPrice !== undefined || query.maxPrice !== undefined) {
		const priceField = query.sale === "1" ? "salePrice" : "price";
		const range = {};
		if (query.minPrice !== undefined) range.$gte = query.minPrice;
		if (query.maxPrice !== undefined) range.$lte = query.maxPrice;
		conditions.push({ [priceField]: range });
	}

	if (conditions.length > 0) {
		filter.variants = { $elemMatch: { $and: conditions } };
	}

	const priceKey = query.sale === "1" ? "minSalePrice" : "minPrice";
	const sortMap = {
		featured: { createdAt: -1 },
		price_asc: { [priceKey]: 1 },
		price_desc: { [priceKey]: -1 },
	};

	return Product.find(filter)
		.sort(sortMap[query.sort] ?? sortMap.featured)
		.lean();
}

export async function setProductSale(id, onSale) {
	await connectDB();
	assertValidId(id);

	const product = await Product.findById(id);
	if (!product) throw new AppError("Product not found", 404);

	if (onSale) {
		if (product.variants.some((v) => v.salePrice == null)) {
			throw new AppError(
				"Set a sale price for every variant before turning sale on",
				400,
			);
		}
		if (product.variants.some((v) => v.salePrice >= v.price)) {
			throw new AppError(
				"Sale price must be less than price for every variant",
				400,
			);
		}
	} else {
		product.saleNote = "";
	}

	product.onSale = onSale;

	try {
		await product.save();
		return product.toJSON();
	} catch (error) {
		throw mapError(error);
	}
}

export async function listProductsByCollection(slug, limit = 12) {
	await connectDB();

	return Product.find({
		isActive: true,
		variants: { $elemMatch: { stock: { $gt: 0 } } },
		$or: [{ collection: slug }, { childCollection: slug }],
	})
		.sort({ createdAt: -1 })
		.limit(limit)
		.lean();
}
