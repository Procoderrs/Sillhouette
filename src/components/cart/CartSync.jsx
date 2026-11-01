"use client";

import { useEffect } from "react";
import { useCartStore, toApiItem } from "@/store/cartStore";

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function CartSync({ user }) {
	const userId = user?._id ?? user?.id ?? null;

	useEffect(() => {
		if (!userId) return;

		let cancelled = false;
		let unsubscribe = () => {};
		let saveTimer = null;

		(async () => {
			// Login ke baad guest cart server mein merge hogi
			try {
				const local = useCartStore.getState().items.map(toApiItem);
				const res = await fetch("/api/cart/merge", {
					method: "POST",
					headers: JSON_HEADERS,
					body: JSON.stringify({ items: local }),
				});
				const data = await res.json();
				if (res.ok && !cancelled) {
					useCartStore.setState({ items: data.data });
				}
			} catch (err) {
				console.error("Cart merge failed:", err);
			}

			if (cancelled) return;

			// Merge ke baad har change server par save hogi
			unsubscribe = useCartStore.subscribe((state) => {
				clearTimeout(saveTimer);
				saveTimer = setTimeout(() => {
					fetch("/api/cart", {
						method: "PUT",
						headers: JSON_HEADERS,
						body: JSON.stringify({ items: state.items.map(toApiItem) }),
					}).catch((err) => console.error("Cart save failed:", err));
				}, 500);
			});
		})();

		return () => {
			cancelled = true;
			unsubscribe();
			clearTimeout(saveTimer);
		};
	}, [userId]);

	return null;
}
