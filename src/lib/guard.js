import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

// Admin APIs ke liye: login aur admin role dono zaroori hain
export async function requireAdmin(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = await verifyToken(token);

	if (!session) {
		return {
			response: NextResponse.json(
				{ success: false, message: "Not logged in" },
				{ status: 401 },
			),
		};
	}

	if (session.role !== "admin") {
		return {
			response: NextResponse.json(
				{ success: false, message: "Forbidden" },
				{ status: 403 },
			),
		};
	}

	return { session };
}
