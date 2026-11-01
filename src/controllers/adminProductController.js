import { NextResponse } from "next/server";
import { productSchema, productQuerySchema } from "@/validators/productSchema";

import {
	createProduct,
	updateProduct,
	hideProduct,
	listProducts,
	getProductById,
} from "@/services/productService";
import { requireAdmin } from "@/lib/guard";
import { errorResponse, validationResponse, readBody } from "@/lib/http";
import { setProductSale } from "@/services/productService";

export async function adminListProducts(request) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const query = Object.fromEntries(new URL(request.url).searchParams);
	const parsed = productQuerySchema.safeParse(query);
	if (!parsed.success) return validationResponse(parsed.error.issues);

	try {
		const products = await listProducts(parsed.data, { includeInactive: true });
		return NextResponse.json({ success: true, data: products });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminCreateProduct(request) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body is not valid JSON" },
			{ status: 400 },
		);
	}

	const parsed = productSchema.safeParse(body);
	if (!parsed.success) return validationResponse(parsed.error.issues);

	try {
		const product = await createProduct(parsed.data);
		return NextResponse.json({ success: true, data: product }, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminUpdateProduct(request, { params }) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const { id } = await params;

	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body is not valid JSON" },
			{ status: 400 },
		);
	}

	const parsed = productSchema.safeParse(body);
	if (!parsed.success) return validationResponse(parsed.error.issues);

	try {
		const product = await updateProduct(id, parsed.data);
		return NextResponse.json({ success: true, data: product });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminHideProduct(request, { params }) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const { id } = await params;

	try {
		const product = await hideProduct(id);
		return NextResponse.json({ success: true, data: product });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminGetProduct(request, { params }) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const { id } = await params;

	try {
		const product = await getProductById(id);
		return NextResponse.json({ success: true, data: product });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminSetProductSale(request, { params }) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const { id } = await params;
		const body = await readBody(request);

		if (typeof body?.onSale !== "boolean") {
			return Response.json(
				{ success: false, message: "onSale must be true or false" },
				{ status: 400 },
			);
		}

		const product = await setProductSale(id, body.onSale);
		return Response.json({ success: true, data: product }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}
