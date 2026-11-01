import { requireAdmin } from "@/lib/guard";
import { errorResponse, readBody, validationResponse } from "@/lib/http";
import {
	homeSectionCreateSchema,
	homeSectionUpdateSchema,
} from "@/validators/homeSectionSchema";
import {
	listHomeSections,
	createHomeSection,
	updateHomeSection,
	deleteHomeSection,
} from "@/services/homeSectionService";

export async function adminListHomeSections(request) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const data = await listHomeSections({ includeInactive: true });
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminCreateHomeSection(request) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const body = await readBody(request);
		const parsed = homeSectionCreateSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const data = await createHomeSection(parsed.data);
		return Response.json({ success: true, data }, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminUpdateHomeSection(request, { params }) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const { id } = await params;
		const body = await readBody(request);
		const parsed = homeSectionUpdateSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const data = await updateHomeSection(id, parsed.data);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminDeleteHomeSection(request, { params }) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const { id } = await params;
		const data = await deleteHomeSection(id);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}
