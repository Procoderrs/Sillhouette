"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

export default function OrderStatus({ status }) {
	const router = useRouter();

	useEffect(() => {
		if (status === "paid") {
			useCartStore.getState().clear();
			return;
		}
		if (status !== "pending_payment") return;

		// Webhook thodi der mein aata hai, is liye status ko kuch dafa refresh karein
		let tries = 0;
		const timer = setInterval(() => {
			tries += 1;
			router.refresh();
			if (tries >= 10) clearInterval(timer);
		}, 3000);

		return () => clearInterval(timer);
	}, [status, router]);

	return null;
}
