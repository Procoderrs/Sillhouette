import { NextResponse } from "next/server";
import { AppError } from "@/lib/errors";

export function errorResponse(error) {
	if (error instanceof AppError) {
		return NextResponse.json(
			{ success: false, message: error.message },
			{ status: error.status },
		);
	}

	console.error(error);
	return NextResponse.json(
		{ success: false, message: "Something went wrong on the server" },
		{ status: 500 },
	);
}

// Field ka naam "variants.0.salePrice" jaisa hoga, taake form mein sahi row par error dikhe
export function validationResponse(issues) {
	const errors = {};
	for (const issue of issues) {
		const key = issue.path.join(".") || "form";
		if (!errors[key]) errors[key] = issue.message;
	}

	return NextResponse.json(
		{ success: false, message: "Invalid input", errors },
		{ status: 400 },
	);
}

export async function readBody(request) {
	try {
		return await request.json();
	} catch {
		return null;
	}
}
