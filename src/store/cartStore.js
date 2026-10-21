import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((s) => ({ items: [...s.items, item] })),
      removeItem: (id, size) =>
        set((s) => ({
          items: s.items.filter((i) => !(i.id === id && i.size === size)),
        })),
      updateQty: (id, size, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.id === id && i.size === size ? { ...i, qty } : i
          ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "silhouette-cart" }
  )
);