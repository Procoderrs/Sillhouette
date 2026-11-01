import { NextResponse } from "next/server";
import { getNavigation } from "@/services/collectionService";
import { errorResponse } from "@/lib/http";

export async function getCollectionNavigation() {
	try {
		const data = await getNavigation();
		return NextResponse.json({ success: true, data });
	} catch (error) {
		return errorResponse(error);
	}
}
