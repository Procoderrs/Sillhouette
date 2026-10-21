"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";
import { formatPrice } from "@/lib/utils";

export default function CartDrawer() {
	const open = useCartDrawer((s) => s.open);
	const setOpen = useCartDrawer((s) => s.setOpen);

	const items = useCartStore((s) => s.items);
	const updateQty = useCartStore((s) => s.updateQty);
	const removeItem = useCartStore((s) => s.removeItem);

	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	// Escape dabane par band ho
	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && setOpen(false);
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [setOpen]);

	// Drawer khula ho to page scroll band
	useEffect(() => {
		document.body.style.overflow = open ? "hidden" : "";
	}, [open]);

	if (!open) return null;

	// localStorage server par nahi hota, is liye mount ke baad hi items dikhayein
	const list = mounted ? items : [];
	const subtotal = list.reduce(
		(n, i) => n + (i.salePrice ?? i.price) * i.qty,
		0,
	);

	return (
		<div className="fixed inset-0 z-[60]">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => setOpen(false)}
			/>

			<aside className="absolute right-0 top-0 flex h-full w-full max-w-[400px] flex-col bg-white">
				<div className="flex items-center justify-between border-b border-line px-6 py-5">
					<h2 className="text-[20px] font-semibold tracking-[0.15em]">CART</h2>
					<button onClick={() => setOpen(false)} aria-label="Close cart">
						<X size={22} strokeWidth={1.5} />
					</button>
				</div>

				{list.length === 0 ? (
					<div className="px-6 py-8">
						<p className="text-[15px]">Your cart is currently empty.</p>
						<Link
							href="/"
							onClick={() => setOpen(false)}
							className="btn-primary mt-6 inline-block"
						>
							Continue shopping
						</Link>
					</div>
				) : (
					<>
						<ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
							{list.map((item) => (
								<li key={`${item.id}-${item.size}`} className="flex gap-4 py-5">
									<div className="relative h-28 w-20 shrink-0 bg-soft">
										<Image
											src={item.image}
											alt={item.name}
											fill
											sizes="80px"
											className="object-cover"
										/>
									</div>

									<div className="flex flex-1 flex-col text-[14px]">
										<div className="flex justify-between gap-2">
											<p className="uppercase tracking-[0.1em]">{item.name}</p>
											<button
												onClick={() => removeItem(item.id, item.size)}
												aria-label="Remove item"
											>
												<Trash2 size={16} strokeWidth={1.5} />
											</button>
										</div>

										<p className="mt-1 text-black/60">Size: {item.size}</p>
										<p className="mt-1">
											{formatPrice(item.salePrice ?? item.price)}
										</p>

										<div className="mt-auto flex w-fit items-center border border-line">
											<button
												onClick={() =>
													updateQty(item.id, item.size, item.qty - 1)
												}
												disabled={item.qty <= 1}
												className="px-3 py-1 disabled:opacity-30"
												aria-label="Decrease quantity"
											>
												<Minus size={14} />
											</button>
											<span className="px-3">{item.qty}</span>
											<button
												onClick={() =>
													updateQty(item.id, item.size, item.qty + 1)
												}
												className="px-3 py-1"
												aria-label="Increase quantity"
											>
												<Plus size={14} />
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>

						<div className="border-t border-line px-6 py-5">
							<div className="mb-4 flex justify-between text-[15px]">
								<span className="uppercase tracking-[0.1em]">Subtotal</span>
								<span>{formatPrice(subtotal)}</span>
							</div>
							<Link
								href="/checkout"
								onClick={() => setOpen(false)}
								className="btn-primary block w-full text-center"
							>
								Checkout
							</Link>
							<Link
								href="/cart"
								onClick={() => setOpen(false)}
								className="mt-3 block text-center text-[14px] underline"
							>
								View cart
							</Link>
						</div>
					</>
				)}
			</aside>
		</div>
	);
}
