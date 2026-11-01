import Collection from "@/models/Collection";
import Product from "@/models/Product";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";

function slugify(text) {
	return text
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/(^-|-$)/g, "");
}

async function assertParentExists(parentSlug) {
	const parent = await Collection.findOne({ slug: parentSlug }).lean();
	if (!parent) throw new AppError("Parent collection not found", 400);
	if (parent.type !== "parent") {
		throw new AppError("Selected parent is not a parent collection", 400);
	}
}

async function assertNoOtherSale(excludeId) {
	const filter = { isSale: true };
	if (excludeId) filter._id = { $ne: excludeId };

	if (await Collection.exists(filter)) {
		throw new AppError(
			"A sale collection already exists. Remove it from sale first",
			409,
		);
	}
}

export async function listCollections() {
	await connectDB();
	// "parent" alphabetically "child" se baad mein aata hai, isliye -1 se parents pehle aayenge
	return Collection.find().sort({ type: -1, order: 1, name: 1 }).lean();
}

// Public navigation: header ke liye parents, har parent ke andar uske children
export async function getNavigation() {
	await connectDB();

	const [parents, children] = await Promise.all([
		Collection.find({ type: "parent", isActive: true, showInNav: true })
			.sort({ order: 1, name: 1 })
			.lean(),
		Collection.find({ type: "child", isActive: true })
			.sort({ order: 1, name: 1 })
			.lean(),
	]);

	return parents.map((p) => ({
		...p,
		children: children.filter((c) => c.parent === p.slug),
	}));
}

export async function createCollection(input) {
	await connectDB();

	const slug = slugify(input.name);
	if (!slug) {
		throw new AppError("Name must contain letters or numbers", 400);
	}
	const parent = input.type === "child" ? input.parent : "";

	if (await Collection.exists({ slug, parent })) {
		throw new AppError(
			"A collection with this name is already exist under this parent ",
			409,
		);
	}

	if (input.type === "child") await assertParentExists(input.parent);
	if (input.isSale) await assertNoOtherSale();

	const created = await Collection.create({
		...input,
		slug,
		parent,
	});

	return created.toJSON();
}

export async function updateCollection(id, input) {
	await connectDB();

	const current = await Collection.findById(id);
	if (!current) throw new AppError("Collection not found", 404);

	// Slug kabhi nahi badalta, warna products ke links toot jayenge
	const hasChildren = await Collection.exists({ parent: current.slug });
	if (hasChildren && input.type !== "parent") {
		throw new AppError(
			"This collection has child collections. Delete them first",
			409,
		);
	}

	if (input.type === "child") {
		if (input.parent === current.slug) {
			throw new AppError("A collection cannot be its own parent", 400);
		}
		await assertParentExists(input.parent);
	}

	if (input.isSale) await assertNoOtherSale(id);

	current.set({
		name: input.name,
		type: input.type,
		parent: input.type === "child" ? input.parent : "",
		order: input.order,
		showInNav: input.showInNav,
		isSale: input.isSale,
		isActive: input.isActive,
	});

	await current.save();
	return current.toJSON();
}

export async function deleteCollection(id) {
	await connectDB();

	const current = await Collection.findById(id);
	if (!current) throw new AppError("Collection not found", 404);

	if (await Collection.exists({ parent: current.slug })) {
		throw new AppError("Delete child collections first", 409);
	}

	const inUse =
		current.type === "child"
			? await Product.exists({
					collection: current.parent,
					childCollection: current.slug,
				})
			: await Product.exists({ collection: current.slug });

	if (inUse) {
		throw new AppError(
			"Products are using this collection. Move them first",
			409,
		);
	}

	await current.deleteOne();
	return { id };
}

export async function getCollectionPage(parentSlug, childSlug) {
	await connectDB();

	if (childSlug) {
		const child = await Collection.findOne({
			slug: childSlug,
			parent: parentSlug,
			type: "child",
			isActive: true,
		}).lean();
		if (!child) return null;

		const products = await Product.find({
			collection: parentSlug,
			childCollection: childSlug,
			isActive: true,
		})
			.sort({ createdAt: -1 })
			.lean();

		return { collection: child, products };
	}

	const parent = await Collection.findOne({
		slug: parentSlug,
		type: "parent",
		isActive: true,
	}).lean();
	if (!parent) return null;

	// Sale collection par sirf sale wale products, baaki par us parent ke sab products
	const filter = parent.isSale
		? { onSale: true, isActive: true }
		: { collection: parentSlug, isActive: true };

	const products = await Product.find(filter).sort({ createdAt: -1 }).lean();

	return { collection: parent, products };
}
