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
		const parsed = checkoutSchema.safeParse(body);

		if (!parsed.success) {
			console.log("CHECKOUT_VALIDATION:", parsed.error.issues);
			return validationResponse(parsed.error.issues);
		}

		// If the user is logged in, take their id (null for guests)
		let userId = null;
		const token = request.cookies.get(COOKIE_NAME)?.value;
		if (token) {
			try {
				const session = await verifyToken(token);
				userId = session?.userId ?? session?.sub ?? session?.id ?? null;
			} catch {
				userId = null;
			}
		}

		const result = await createCheckout({ ...parsed.data, userId });

		return Response.json({ success: true, data: result }, { status: 201 });
	} catch (err) {
		console.error("CHECKOUT_ERROR:", err);
		return errorResponse(err);
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

			case "payment_intent.succeeded": {
				const intent = event.data.object;
				await markOrderPaid({
					id: intent.id,
					payment_intent: intent.id,
					metadata: intent.metadata,
				});
				break;
			}
			case "payment_intent.payment_failed": {
				const intent = event.data.object;
				await markOrderFailed(
					{
						id: intent.id,
						payment_intent: intent.id,
						metadata: intent.metadata,
					},
					"payment_failed",
				);
				break;
			}
			case "checkout.session.async_payment_failed":
				await markOrderFailed(obj, "payment_failed");
				break;

			default:
				break;
		}

		return new Response("ok", { status: 200 });
	} catch (error) {
		// Returning 500 makes Stripe retry the webhook
		console.error("Stripe webhook handling failed:", error);
		return new Response("Handler error", { status: 500 });
	}
}
