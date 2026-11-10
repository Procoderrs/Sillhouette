import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/orderStatus";

export const orderStatusSchema = z.object({
	status: z.enum(ORDER_STATUSES),
	note: z.string().trim().max(200).optional().default(""),
});
