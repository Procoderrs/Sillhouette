import { NextResponse } from "next/server";
import { collectionSchema } from "@/validators/collectionSchema";
import {
	listCollections,
	createCollection,
	updateCollection,
	deleteCollection,
} from "@/services/collectionService";
import { requireAdmin } from "@/lib/guard";
import { errorResponse, validationResponse, readBody } from "@/lib/http";

export async function adminListCollections(request) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	try {
		const data = await listCollections();
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminCreateCollection(request) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const body = await readBody(request);
	if (!body) {
		return NextResponse.json(
			{ success: false, message: "Request body is not valid JSON" },
			{ status: 400 },
		);
	}

	const parsed = collectionSchema.safeParse(body);
	if (!parsed.success) return validationResponse(parsed.error.issues);

	try {
		const data = await createCollection(parsed.data);
		return NextResponse.json({ success: true, data }, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminUpdateCollection(request, { params }) {
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

	const parsed = collectionSchema.safeParse(body);
	if (!parsed.success) return validationResponse(parsed.error.issues);

	try {
		const data = await updateCollection(id, parsed.data);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminDeleteCollection(request, { params }) {
	const guard = await requireAdmin(request);
	if (guard.response) return guard.response;

	const { id } = await params;

	try {
		const data = await deleteCollection(id);
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return errorResponse(error);
	}
}
