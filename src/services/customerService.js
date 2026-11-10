import crypto from "crypto";
import bcrypt from "bcryptjs";
import User from "@/models/User";

// Email se user dhoondta hai. Na mile to naya account banata hai.
export async function ensureCustomerForOrder({ email, name }) {
	const normalized = email.trim().toLowerCase();

	const existing = await User.findOne({ email: normalized }).lean();
	if (existing) {
		return {
			userId: existing._id,
			created: false,
			email: normalized,
			firstName: existing.firstName,
		};
	}

	const parts = name.trim().split(/\s+/);
	const firstName = parts[0];
	const lastName = parts.slice(1).join(" ") || firstName;

	// Random password, taake user reset code se apna password set kare
	const passwordHash = await bcrypt.hash(
		crypto.randomBytes(32).toString("hex"),
		10,
	);

	try {
		const user = await User.create({
			firstName,
			lastName,
			email: normalized,
			passwordHash,
		});
		return {
			userId: user._id,
			created: true,
			email: normalized,
			firstName,
		};
	} catch (error) {
		// Do orders ek saath aayein to unique index yahan pakad lega
		if (error.code === 11000) {
			const dup = await User.findOne({ email: normalized }).lean();
			return {
				userId: dup._id,
				created: false,
				email: normalized,
				firstName: dup.firstName,
			};
		}
		throw error;
	}
}
