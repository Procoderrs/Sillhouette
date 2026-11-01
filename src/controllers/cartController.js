import { COOKIE_NAME, verifyToken } from "@/lib/auth";
import { errorResponse, readBody, validationResponse } from "@/lib/http";
import { cartItemsSchema } from "@/validators/cartSchema";
import {
	quoteCart,
	getServerItems,
	saveServerItems,
	mergeServerItems,
} from "@/services/cartService";

async function getUserId(request) {
	const token = request.cookies.get(COOKIE_NAME)?.value;
	const session = await verifyToken(token);
	return session?.id ?? null;
}

const notLoggedIn = () =>
	Response.json({ success: false, message: "Not logged in" }, { status: 401 });

export async function cartQuote(request) {
	try {
		const body = await readBody(request);
		const parsed = cartItemsSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const data = await quoteCart(parsed.data.items);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function cartGet(request) {
	const userId = await getUserId(request);
	if (!userId) return notLoggedIn();

	try {
		const data = await getServerItems(userId);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function cartPut(request) {
	const userId = await getUserId(request);
	if (!userId) return notLoggedIn();

	try {
		const body = await readBody(request);
		const parsed = cartItemsSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const data = await saveServerItems(userId, parsed.data.items);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}

export async function cartMerge(request) {
	const userId = await getUserId(request);
	if (!userId) return notLoggedIn();

	try {
		const body = await readBody(request);
		const parsed = cartItemsSchema.safeParse(body ?? {});
		if (!parsed.success) return validationResponse(parsed.error.issues);

		const data = await mergeServerItems(userId, parsed.data.items);
		return Response.json({ success: true, data }, { status: 200 });
	} catch (error) {
		return errorResponse(error);
	}
}
