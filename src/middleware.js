// src/middleware.js
import { NextResponse } from "next/server";
import { COOKIE_NAME, verifyToken } from "@/lib/auth";

// Ye pages bina login ke khul sakte hain
const PUBLIC_PATHS = ["/account/login", "/account/register"];

export async function middleware(request) {
	const { pathname } = request.nextUrl;

	if (PUBLIC_PATHS.includes(pathname)) {
		return NextResponse.next();
	}

	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = await verifyToken(token);

	// 1. Login nahi hai to login page par bhejein
	if (!session) {
		const loginUrl = new URL("/account/login", request.url);
		loginUrl.searchParams.set("next", pathname);
		return NextResponse.redirect(loginUrl);
	}

	// 2. Admin page par sirf admin jaa sake
	if (pathname.startsWith("/admin") && session.role !== "admin") {
		return NextResponse.redirect(new URL("/account", request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/account/:path*", "/admin/:path*"],
};
