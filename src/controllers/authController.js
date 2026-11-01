// src/controllers/authController.js
import { NextResponse } from "next/server";
import {
	registerSchema,
	loginSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
} from "@/validators/authSchema";
import {
	registerUser,
	loginUser,
	getUserById,
	requestPasswordReset,
	resetPassword,
} from "@/services/authService";
import { AppError } from "@/lib/errors";
import { COOKIE_NAME, cookieOptions, signToken, verifyToken } from "@/lib/auth";

// Har error ko ek hi shape mein bhejna
function errorResponse(error) {
	if (error instanceof AppError) {
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: error.status },
		);
	}

	// Ye unexpected error hai, is ki detail user ko nahi dikhani
	console.error(error);
	return NextResponse.json(
		{ success: false, message: "Server mein kuch masla hai" },
		{ status: 500 },
	);
}

// Validation fail hone par har field ka pehla error
function validationResponse(issues) {
	const errors = {};
	for (const issue of issues) {
		const field = issue.path[0] ?? "form";
		if (!errors[field]) errors[field] = issue.message;
	}

	return NextResponse.json(
		{ success: false, message: "Input sahi nahi hai", errors },
		{ status: 400 },
	);
}

// Body JSON na ho to crash hone ke bajaye null
async function readBody(request) {
	try {
		return await request.json();
	} catch {
		return null;
	}
}

export async function register(request) {
	// 1. Body padhna
	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body sahi JSON nahi hai" },
			{ status: 400 },
		);
	}

	// 2. Validate karna
	const parsed = registerSchema.safeParse(body);
	if (!parsed.success) {
		return validationResponse(parsed.error.issues);
	}

	try {
		// 3. Service ko call karna
		const user = await registerUser(parsed.data);

		// 4. Token banana aur cookie set karna
		const token = await signToken({
			id: user._id.toString(),
			role: user.role,
		});

		// 5. Response (passwordHash khud hat jata hai, kyunki toJSON use hota hai)
		const response = NextResponse.json(
			{ success: true, data: user },
			{ status: 201 },
		);
		response.cookies.set(COOKIE_NAME, token, cookieOptions);
		return response;
	} catch (error) {
		return errorResponse(error);
	}
}

export async function login(request) {
	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body sahi JSON nahi hai" },
			{ status: 400 },
		);
	}

	const parsed = loginSchema.safeParse(body);
	if (!parsed.success) {
		return validationResponse(parsed.error.issues);
	}

	try {
		const user = await loginUser(parsed.data);

		const token = await signToken({
			id: user._id.toString(),
			role: user.role,
		});

		const response = NextResponse.json({ success: true, data: user });
		response.cookies.set(COOKIE_NAME, token, cookieOptions);
		return response;
	} catch (error) {
		return errorResponse(error);
	}
}

export async function logout() {
	const response = NextResponse.json({ success: true, message: "Logged out" });

	// maxAge 0 se cookie browser se delete ho jati hai
	response.cookies.set(COOKIE_NAME, "", { ...cookieOptions, maxAge: 0 });
	return response;
}

export async function me(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = await verifyToken(token);

	if (!session) {
		return NextResponse.json(
			{
				success: false,
				message: "Not logged in",
			},
			{ status: 401 },
		);
	}

	try {
		const user = await getUserById(session.id);
		return NextResponse.json({ success: true, data: user });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function forgotPassword(request) {
	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body is not valid JSON" },
			{ status: 400 },
		);
	}

	const parsed = forgotPasswordSchema.safeParse(body);
	if (!parsed.success) {
		return validationResponse(parsed.error.issues);
	}

	// Response hamesha same rahega, taake koi ye check na kar sake ke email registered hai ya nahi
	const genericResponse = NextResponse.json({
		success: true,
		message: "If this email is registered, a reset code has been sent",
	});

	try {
		await requestPasswordReset(parsed.data);
	} catch (error) {
		// Email bhejne ka masla server log mein dikhega, user ko same response milega
		console.error("Forgot password failed:", error);
	}

	return genericResponse;
}

export async function resetPasswordWithCode(request) {
	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body is not valid JSON" },
			{ status: 400 },
		);
	}

	const parsed = resetPasswordSchema.safeParse(body);
	if (!parsed.success) {
		return validationResponse(parsed.error.issues);
	}

	try {
		await resetPassword(parsed.data);
		return NextResponse.json({
			success: true,
			message: "Password has been reset. Please log in.",
		});
	} catch (error) {
		return errorResponse(error);
	}
}
