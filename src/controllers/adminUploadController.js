import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guard";
import { uploadImage } from "@/lib/cloudinary";
import { AppError } from "@/lib/errors";
import { errorResponse } from "@/lib/http";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 5 * 1024 * 1024;

export async function adminUploadImage(request) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	try {
		const formData = await request.formData();
		const file = formData.get("file");

		if (!file || typeof file === "string") {
			throw new AppError("No file uploaded", 400);
		}
		if (!ALLOWED_TYPES.includes(file.type)) {
			throw new AppError("Only JPG, PNG or WebP images are allowed", 400);
		}
		if (file.size > MAX_BYTES) {
			throw new AppError("Image must be 5MB or smaller", 400);
		}

		const buffer = Buffer.from(await file.arrayBuffer());
		const data = await uploadImage(buffer);

		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}
