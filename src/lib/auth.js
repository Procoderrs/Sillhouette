// src/lib/auth.js
import { SignJWT, jwtVerify } from "jose";

export const COOKIE_NAME = "silhouette_token";
export const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 din

function getSecret() {
	const secret = process.env.JWT_SECRET;
	if (!secret) {
		throw new Error("JWT_SECRET .env.local mein set nahi hai");
	}
	return new TextEncoder().encode(secret);
}

// Token mein sirf user ki id aur role rakhte hain, password ya email nahi
export async function signToken({ id, role }) {
	return new SignJWT({ role })
		.setProtectedHeader({ alg: "HS256" })
		.setSubject(String(id))
		.setIssuedAt()
		.setExpirationTime(`${TOKEN_MAX_AGE}s`)
		.sign(getSecret());
}

// Token sahi hai to payload wapas karta hai, galat ho to null
export async function verifyToken(token) {
	if (!token) return null;
	try {
		const { payload } = await jwtVerify(token, getSecret());
		return { id: payload.sub, role: payload.role };
	} catch {
		return null;
	}
}

// Cookie ki settings. Login par set aur logout par delete dono mein yahi use hogi.
export const cookieOptions = {
	httpOnly: true, // JavaScript se cookie nahi padhi ja sakti
	secure: process.env.NODE_ENV === "production",
	sameSite: "lax",
	path: "/",
	maxAge: TOKEN_MAX_AGE,
};
