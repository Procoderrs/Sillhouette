import { requireAdmin } from "@/lib/guard";
import { errorResponse } from "@/lib/http";
import { deleteReview } from "@/services/reviewService";

export async function DELETE(request, { params }) {
	const { response } = await requireAdmin(request);
	if (response) return response;

	try {
		const { id } = await params;
		await deleteReview(id);
		return Response.json({ success: true });
	} catch (err) {
		return errorResponse(err);
	}
}
