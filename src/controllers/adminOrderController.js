import { requireAdmin } from "@/lib/guard";
import { errorResponse, readBody, validationResponse } from "@/lib/http";
import { orderStatusSchema } from "@/validators/orderStatusSchema";
import { updateOrderStatus } from "@/services/orderService";

export async function adminUpdateOrder(request, { params }) {
	try {
		const guard = await requireAdmin(request);
		if (guard.response) return guard.response;

		const { id } = await params;
		const body = await readBody(request);
		const parsed = orderStatusSchema.safeParse(body);
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const order = await updateOrderStatus(
			id,
			parsed.data.status,
			parsed.data.note,
		);
		return Response.json({ success: true, data: { status: order.status } });
	} catch (err) {
		return errorResponse(err);
	}
}
