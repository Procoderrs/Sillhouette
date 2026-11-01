import mongoose from "mongoose";
import HomeSection from "@/models/HomeSection";
import { connectDB } from "@/lib/db";
import { AppError } from "@/lib/errors";

function assertValidId(id) {
	if (!mongoose.isValidObjectId(id)) {
		throw new AppError("Home section not found", 404);
	}
}

export async function listHomeSections({ includeInactive = false } = {}) {
	await connectDB();

	const filter = includeInactive ? {} : { isActive: true };
	return HomeSection.find(filter).sort({ order: 1, createdAt: 1 }).lean();
}

export async function createHomeSection(input) {
	await connectDB();

	const section = await HomeSection.create(input);
	return section.toJSON();
}

export async function updateHomeSection(id, input) {
	await connectDB();
	assertValidId(id);

	const section = await HomeSection.findByIdAndUpdate(
		id,
		{ $set: input },
		{ new: true, runValidators: true },
	).lean();
	if (!section) throw new AppError("Home section not found", 404);

	return section;
}

export async function deleteHomeSection(id) {
	await connectDB();
	assertValidId(id);

	const section = await HomeSection.findByIdAndDelete(id).lean();
	if (!section) throw new AppError("Home section not found", 404);

	return section;
}
