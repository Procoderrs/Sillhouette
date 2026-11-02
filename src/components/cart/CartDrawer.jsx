"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore, lineKeyOf, toApiItem } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function CartDrawer() {
	const open = useCartDrawer((s) => s.open);
	const setOpen = useCartDrawer((s) => s.setOpen);
	const items = useCartStore((s) => s.items);
	const updateQty = useCartStore((s) => s.updateQty);
	const removeItem = useCartStore((s) => s.removeItem);

	const [quote, setQuote] = useState(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	const itemsKey = JSON.stringify(items);

	useEffect(() => {
		if (items.length === 0) {
			setQuote(null);
			return;
		}

		let cancelled = false;
		setLoading(true);
		setError("");

		fetch("/api/cart/quote", {
			method: "POST",
			headers: JSON_HEADERS,
			body: JSON.stringify({ items: items.map(toApiItem) }),
		})
			.then(async (res) => {
				const data = await res.json();
				if (cancelled) return;
				if (!res.ok)
					throw new Error(data.message || "Cart could not be loaded");
				setQuote(data.data);
			})
			.catch((err) => {
				if (!cancelled) setError(err.message);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemsKey]);

	if (!open) return null;

	const lines = quote?.items ?? [];

	return (
		<div className="fixed inset-0 z-50">
			<div
				className="absolute inset-0 bg-black/40"
				onClick={() => setOpen(false)}
			/>

			<aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white">
				<div className="flex items-center justify-between border-b border-line px-6 py-5">
					<h2 className="text-[16px] uppercase tracking-[0.15em]">Your cart</h2>
					<button
						type="button"
						onClick={() => setOpen(false)}
						aria-label="Close"
					>
						<X size={20} />
					</button>
				</div>

				<div className="flex-1 overflow-y-auto px-6 py-4">
					{items.length === 0 && (
						<p className="text-[14px] text-neutral-500">Your cart is empty.</p>
					)}

					{loading && lines.length === 0 && (
						<p className="text-[14px] text-neutral-500">Loading...</p>
					)}

					{error && <p className="text-[14px] text-sale">{error}</p>}

					<ul className="space-y-6">
						{lines.map((line) => {
							const key = lineKeyOf(line);
							const unavailable = line.status === "unavailable";
							const canIncrease = !unavailable && line.qty < line.stock;

							return (
								<li key={key} className="flex gap-4">
									<div className="h-28 w-20 shrink-0 bg-soft-2">
										{line.image && (
											<img
												src={line.image}
												alt={line.name}
												className="h-full w-full object-cover"
											/>
										)}
									</div>

									<div className="flex-1 space-y-1 text-[13px]">
										<p className="uppercase">{line.name}</p>
										{line.variant && (
											<p className="text-neutral-500">{line.variant}</p>
										)}
										<p>{formatPrice(line.price)}</p>

										{line.status !== "ok" && (
											<p className="text-[12px] text-sale">
												{line.message ??
													(line.status === "out_of_stock"
														? "Out of stock"
														: `Only ${line.stock} left`)}
											</p>
										)}

										<div className="flex items-center gap-3 pt-2">
											<button
												type="button"
												disabled={unavailable || line.qty <= 1}
												onClick={() => updateQty(key, line.qty - 1)}
												className="disabled:opacity-30"
											>
												<Minus size={14} />
											</button>
											<span className="w-6 text-center">{line.qty}</span>
											<button
												type="button"
												disabled={!canIncrease}
												onClick={() => updateQty(key, line.qty + 1)}
												className="disabled:opacity-30"
											>
												<Plus size={14} />
											</button>
											<button
												type="button"
												onClick={() => removeItem(key)}
												aria-label="Remove"
												className="ml-3"
											>
												<Trash2 size={14} />
											</button>
										</div>
									</div>
								</li>
							);
						})}
					</ul>
				</div>

				{quote && items.length > 0 && (
					<div className="space-y-3 border-t border-line px-6 py-5 text-[14px]">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>{formatPrice(quote.subtotal)}</span>
						</div>
						<div className="flex justify-between">
							<span>Express</span>
							<span>{formatPrice(quote.expressTotal)}</span>
						</div>
						<div className="flex justify-between font-semibold">
							<span>Total</span>
							<span>{formatPrice(quote.total)}</span>
						</div>
						<p className="text-[12px] text-neutral-500">
							Shipping calculated at checkout.
						</p>
						<Link
							href="/checkout"
							onClick={() => setOpen(false)}
							className="btn-primary block w-full text-center"
						>
							Checkout
						</Link>
					</div>
				)}
			</aside>
		</div>
	);
}
