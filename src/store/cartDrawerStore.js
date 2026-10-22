import { create } from "zustand";

export const useCartDrawer = create((set) => ({
	open: false,
	setOpen: (open) => set({ open }),
}));
