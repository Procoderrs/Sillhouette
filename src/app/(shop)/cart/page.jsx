"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartPage() {
	const items = useCartStore((s) => s.items);
	const updateQty = useCartStore((s) => s.updateQty);
	const removeItem = useCartStore((s) => s.removeItem);

	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	// localStorage server par nahi hota, is liye mount ke baad hi dikhayein
	if (!mounted) {
		return <section className="site-container min-h-[50vh] py-16" />;
	}

	const list = items;
	const subtotal = list.reduce(
		(n, i) => n + (i.salePrice ?? i.price) * i.qty,
		0,
	);

	return (
		<section className="site-container py-12">
			<h1 className="mb-10 text-center text-[24px] tracking-[0.2em]">CART</h1>

			{list.length === 0 ? (
				<div className="text-center">
					<p className="mb-6 text-[15px]">Your cart is currently empty.</p>
					<Link href="/" className="btn-primary inline-block">
						Continue shopping
					</Link>
				</div>
			) : (
				<div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_320px]">
					<ul className="divide-y divide-line">
						{list.map((item) => (
							<li key={`${item.id}-${item.size}`} className="flex gap-5 py-6">
								<div className="relative h-36 w-28 shrink-0 bg-soft">
									<Image
										src={item.image}
										alt={item.name}
										fill
										sizes="112px"
										className="object-cover"
									/>
								</div>

								<div className="flex flex-1 flex-col text-[15px]">
									<div className="flex justify-between gap-4">
										<p className="uppercase tracking-[0.1em]">{item.name}</p>
										<button
											onClick={() => removeItem(item.id, item.size)}
											aria-label="Remove item"
										>
											<Trash2 size={18} strokeWidth={1.5} />
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
											className="px-3 py-2 disabled:opacity-30"
											aria-label="Decrease quantity"
										>
											<Minus size={14} />
										</button>
										<span className="px-4">{item.qty}</span>
										<button
											onClick={() =>
												updateQty(item.id, item.size, item.qty + 1)
											}
											className="px-3 py-2"
											aria-label="Increase quantity"
										>
											<Plus size={14} />
										</button>
									</div>
								</div>
							</li>
						))}
					</ul>

					<aside className="h-fit border border-line p-6">
						<div className="mb-4 flex justify-between text-[15px]">
							<span className="uppercase tracking-[0.1em]">Subtotal</span>
							<span>{formatPrice(subtotal)}</span>
						</div>
						<p className="mb-6 text-[13px] text-black/60">
							Shipping calculated at checkout.
						</p>
						<Link
							href="/checkout"
							className="btn-primary block w-full text-center"
						>
							Checkout
						</Link>
					</aside>
				</div>
			)}
		</section>
	);
}
