import { NextResponse } from "next/server";
import { productQuerySchema } from "@/validators/productSchema";
import { listProducts, getProductBySlug } from "@/services/productService";
import { errorResponse, validationResponse } from "@/lib/http";

export async function getProducts(request) {
	const query = Object.fromEntries(new URL(request.url).searchParams);

	const parsed = productQuerySchema.safeParse(query);
	if (!parsed.success) {
		return validationResponse(parsed.error.issues);
	}

	try {
		const products = await listProducts(parsed.data);
		return NextResponse.json({ success: true, data: products });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function getProduct(_request, { params }) {
	const { slug } = await params;

	try {
		const product = await getProductBySlug(slug);
		return NextResponse.json({ success: true, data: product });
	} catch (error) {
		return errorResponse(error);
	}
}
