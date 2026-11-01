import {
	adminListCollections,
	adminCreateCollection,
} from "@/controllers/adminCollectionController";

export const GET = adminListCollections;
export const POST = adminCreateCollection;
