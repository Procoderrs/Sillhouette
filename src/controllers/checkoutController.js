import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { errorResponse, readBody, validationResponse } from "@/lib/http";
import { checkoutSchema } from "@/validators/checkoutSchema";
import {
	createCheckout,
	markOrderPaid,
	markOrderFailed,
} from "@/services/orderService";
import { getStripe } from "@/lib/stripe";

export async function checkoutCreate(request) {
	try {
		const body = await readBody(request);
		const parsed = checkoutSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		// Guest bhi order kar sakta hai, login hai to user se link ho jayega
		const token = request.cookies.get(COOKIE_NAME)?.value;
		const session = await verifyToken(token);

		const data = await createCheckout({
			...parsed.data,
			userId: session?.id ?? null,
		});
		return Response.json({ success: true, data }, { status: 201 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function stripeWebhook(request) {
	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	let event;
	try {
		event = getStripe().webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET,
		);
	} catch (error) {
		console.error("Stripe signature verification failed:", error.message);
		return new Response("Invalid signature", { status: 400 });
	}

	try {
		const obj = event.data.object;

		switch (event.type) {
			case "checkout.session.completed":
			case "checkout.session.async_payment_succeeded":
				if (obj.payment_status === "paid") await markOrderPaid(obj);
				break;

			case "checkout.session.expired":
				await markOrderFailed(obj, "cancelled");
				break;

			case "checkout.session.async_payment_failed":
				await markOrderFailed(obj, "payment_failed");
				break;

			default:
				break;
		}

		return new Response("ok", { status: 200 });
	} catch (error) {
		// 500 dene se Stripe retry karega
		console.error("Stripe webhook handling failed:", error);
		return new Response("Handler error", { status: 500 });
	}
}
