import Settings from "@/models/Settings";
import { connectDB } from "@/lib/db";

const KEY = "store";

// Pehli dafa document khud ban jata hai, defaults ke saath
export async function getSettings() {
	await connectDB();

	return Settings.findOneAndUpdate(
		{ key: KEY },
		{ $setOnInsert: { key: KEY } },
		{ upsert: true, new: true, setDefaultsOnInsert: true },
	).lean();
}

export async function updateSettings(input) {
	await connectDB();

	return Settings.findOneAndUpdate(
		{ key: KEY },
		{ $set: input },
		{ upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
	).lean();
}
