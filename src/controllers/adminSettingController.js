import { requireAdmin } from "@/lib/guard";
import { errorResponse, readBody, validationResponse } from "@/lib/http";
import { settingsSchema } from "@/validators/settingSchema";
import { getSettings, updateSettings } from "@/services/settingService";

export async function adminGetSettings(request) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const settings = await getSettings();
		return Response.json({ success: true, data: settings }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function adminUpdateSettings(request) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const body = await readBody(request);
		const parsed = settingsSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const settings = await updateSettings(parsed.data);
		return Response.json({ success: true, data: settings }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}
