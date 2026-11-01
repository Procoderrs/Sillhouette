import {
	adminGetProduct,
	adminUpdateProduct,
	adminHideProduct,
} from "@/controllers/adminProductController";

export const GET = adminGetProduct;
export const PATCH = adminUpdateProduct;
export const DELETE = adminHideProduct;
