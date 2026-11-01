import { z } from "zod";
import { cartItemsSchema } from "@/validators/cartSchema";

export const checkoutSchema = z.object({
	name: z.string().trim().min(2, "Naam likhein").max(80),
	email: z.string().trim().email("Sahi email likhein"),
	phone: z.string().trim().min(7, "Phone number likhein").max(20),
	address: z.string().trim().min(5, "Address likhein").max(200),
	city: z.string().trim().min(2, "City likhein").max(60),
	postalCode: z.string().trim().max(20).default(""),
	country: z.string().trim().min(2, "Country likhein").max(60),
	items: cartItemsSchema.shape.items,
});
