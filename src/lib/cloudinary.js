import { v2 as cloudinary } from "cloudinary";

export function getCloudinary() {
	const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } =
		process.env;

	if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
		throw new Error("Cloudinary environment variables are missing");
	}

	cloudinary.config({
		cloud_name: CLOUDINARY_CLOUD_NAME,
		api_key: CLOUDINARY_API_KEY,
		api_secret: CLOUDINARY_API_SECRET,
		secure: true,
	});

	return cloudinary;
}

export function uploadImage(buffer, folder = "silhouette/products") {
	const cld = getCloudinary();

	return new Promise((resolve, reject) => {
		const stream = cld.uploader.upload_stream(
			{ folder, resource_type: "image" },
			(error, result) => {
				if (error) return reject(error);
				resolve({ url: result.secure_url, publicId: result.public_id });
			},
		);
		stream.end(buffer);
	});
}
