import { cookies } from "next/headers";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { getUserById } from "@/services/authService";
import { AppError } from "@/lib/errors";

export async function getCurrentUser() {
	const cookieStore = await cookies();
	const session = await verifyToken(cookieStore.get(COOKIE_NAME)?.value);

	if (!session) return null;

	try {
		const user = await getUserById(session.id);
		return user.toJSON();
	} catch (error) {
		// User na mile to null, baaqi errors ko chhupana nahi hai
		if (error instanceof AppError && error.status === 404) {
			return null;
		}
		console.error("getCurrentUser failed:", error);
		throw error;
	}
}
