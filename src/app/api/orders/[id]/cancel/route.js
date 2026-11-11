import { getCurrentUser } from "@/lib/session";
import { errorResponse } from "@/lib/http";
import { cancelOrderByCustomer } from "@/services/orderService";

export async function POST(request, { params }) {
	try {
		const { id } = await params;
		const body = await request.json().catch(() => ({}));
		const user = await getCurrentUser();

		const order = await cancelOrderByCustomer({
			orderId: id,
			token: body.token,
			userId: user?._id,
		});

		return Response.json({ success: true, data: { status: order.status } });
	} catch (err) {
		return errorResponse(err);
	}
}
