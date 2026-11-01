import { create } from "zustand";
import { persist } from "zustand/middleware";

// Line ki pehchaan: product + variant attributes
export function lineKeyOf(item) {
	const attrs = [...(item.attributes ?? [])]
		.sort((a, b) => a.name.localeCompare(b.name))
		.map((a) => `${a.name}=${a.value}`)
		.join("|");
	return `${item.productId}|${attrs}`;
}

// Server ko sirf wo fields bhejein jo wo samajhta hai
export function toApiItem(item) {
	return {
		productId: item.productId,
		attributes: item.attributes ?? [],
		qty: item.qty,
		express: Boolean(item.express),
		choices: item.choices ?? [],
	};
}

export const useCartStore = create(
	persist(
		(set) => ({
			items: [],

			addItem: (item) =>
				set((s) => {
					const key = lineKeyOf(item);
					const exists = s.items.some((i) => lineKeyOf(i) === key);

					if (!exists) {
						return { items: [...s.items, item] };
					}

					return {
						items: s.items.map((i) =>
							lineKeyOf(i) === key
								? {
										...i,
										qty: Math.min(i.qty + item.qty, 20),
										express: item.express,
										choices: item.choices,
									}
								: i,
						),
					};
				}),

			removeItem: (key) =>
				set((s) => ({
					items: s.items.filter((i) => lineKeyOf(i) !== key),
				})),

			updateQty: (key, qty) =>
				set((s) => ({
					items:
						qty < 1
							? s.items.filter((i) => lineKeyOf(i) !== key)
							: s.items.map((i) => (lineKeyOf(i) === key ? { ...i, qty } : i)),
				})),

			clear: () => set({ items: [] }),
		}),
		{
			name: "silhouette-cart",
			version: 3,
			// Purane format ka cart hata dein
			migrate: () => ({ items: [] }),
		},
	),
);
