import { z } from "zod";
import { getCurrentUser } from "@/lib/session";
import { readBody, errorResponse, validationResponse } from "@/lib/http";
import { reviewSchema } from "@/validators/reviewSchema";
import { createReview } from "@/services/reviewService";

const createBodySchema = reviewSchema.extend({
	productId: z.string().min(1, "Product is required"),
});

export async function POST(request) {
	try {
		const body = await readBody(request);

		// Honeypot: bots ye field bhar dete hain. Unhe success dikhayein, lekin save na karein.
		if (body.website) {
			return Response.json({ success: true }, { status: 201 });
		}

		const parsed = createBodySchema.safeParse(body);
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const user = await getCurrentUser();
		const review = await createReview({
			userId: user?._id ?? null,
			...parsed.data,
		});

		return Response.json({ success: true, data: review }, { status: 201 });
	} catch (err) {
		return errorResponse(err);
	}
}
