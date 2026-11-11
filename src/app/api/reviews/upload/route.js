import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request) {
	try {
		const form = await request.formData();
		const file = form.get("file");

		if (!file || typeof file === "string") {
			return Response.json(
				{ success: false, message: "No file selected" },
				{ status: 400 },
			);
		}
		if (!ALLOWED_TYPES.includes(file.type)) {
			return Response.json(
				{ success: false, message: "Only JPG, PNG or WEBP images are allowed" },
				{ status: 400 },
			);
		}
		if (file.size > MAX_BYTES) {
			return Response.json(
				{ success: false, message: "Image must be 5MB or smaller" },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		const url = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream(
					{ folder: "silhouette/reviews", resource_type: "image" },
					(err, result) => (err ? reject(err) : resolve(result.secure_url)),
				)
				.end(buffer);
		});

		return Response.json({ success: true, data: { url } }, { status: 201 });
	} catch (err) {
		console.error("REVIEW_UPLOAD_ERROR:", err);
		return Response.json(
			{ success: false, message: "Upload failed, please try again" },
			{ status: 500 },
		);
	}
}
