"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { X, Search } from "lucide-react";
import { menu, topLinks } from "@/data/menu";
import { products } from "@/data/products";
import { formatPrice } from "@/lib/utils";

export default function SearchOverlay({ open, onClose }) {
	const [q, setQ] = useState("");

	// Escape dabane par band ho, aur page scroll rok de
	useEffect(() => {
		if (!open) return;
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open, onClose]);

	const query = q.trim().toLowerCase();

	const collections = useMemo(() => {
		if (!query) return [];
		const all = [...topLinks, ...menu.flatMap((m) => m.children)];
		const seen = new Set();
		return all
			.filter((c) => {
				if (seen.has(c.slug) || !c.label.toLowerCase().includes(query)) {
					return false;
				}
				seen.add(c.slug);
				return true;
			})
			.slice(0, 6);
	}, [query]);

	const matched = useMemo(() => {
		if (!query) return [];
		return products
			.filter((p) => p.name.toLowerCase().includes(query))
			.slice(0, 4);
	}, [query]);

	if (!open) return null;

	return (
		<div className="fixed inset-0 z-[70] bg-black/40">
			<div className="absolute inset-x-0 top-0 bg-white">
				<div className="site-container py-6">
					<form action="/search" className="flex items-center gap-4">
						<input
							name="q"
							value={q}
							onChange={(e) => setQ(e.target.value)}
							autoFocus
							placeholder="Search"
							className="h-12 flex-1 border border-black px-4 text-[16px] outline-none"
						/>
						<button type="submit" aria-label="Search">
							<Search size={24} strokeWidth={1.5} />
						</button>
						<button type="button" onClick={onClose} aria-label="Close search">
							<X size={26} strokeWidth={1.5} />
						</button>
					</form>
				</div>

				{query && (
					<div className="border-t border-line">
						<div className="site-container grid gap-10 py-10 md:grid-cols-2">
							<div>
								<h3 className="mb-4 border-b border-line pb-2 text-[13px] uppercase tracking-[0.3em]">
									Collections
								</h3>
								<ul className="space-y-4">
									{collections.map((c) => (
										<li key={c.slug}>
											<Link
												href={c.href ?? `/collections/${c.slug}`}
												onClick={onClose}
												className="text-[16px] hover:underline"
											>
												{c.label}
											</Link>
										</li>
									))}
									{!collections.length && (
										<li className="text-black/60">No collections found.</li>
									)}
								</ul>
							</div>

							<div>
								<h3 className="mb-4 border-b border-line pb-2 text-[13px] uppercase tracking-[0.3em]">
									Products
								</h3>
								<ul className="space-y-6">
									{matched.map((p) => (
										<li key={p.id}>
											<Link
												href={`/products/${p.slug}`}
												onClick={onClose}
												className="flex gap-4"
											>
												<div className="relative h-24 w-20 shrink-0 bg-soft">
													<Image
														src={p.images[0]}
														alt={p.name}
														fill
														sizes="80px"
														className="object-cover"
													/>
												</div>
												<div>
													<p className="text-[16px]">{p.name}</p>
													<p className="mt-1 text-[12px] uppercase tracking-[0.3em] text-black/60">
														Sillhouete
													</p>
													<p className="mt-1 text-[14px]">
														{formatPrice(p.salePrice ?? p.price)}
													</p>
												</div>
											</Link>
										</li>
									))}
									{!matched.length && (
										<li className="text-black/60">No products found.</li>
									)}
								</ul>
							</div>
						</div>

						<Link
							href={`/search?q=${encodeURIComponent(q.trim())}`}
							onClick={onClose}
							className="block border-t border-line py-5 text-center text-[15px]"
						>
							Show all results for &quot;{q.trim()}&quot; →
						</Link>
					</div>
				)}
			</div>
		</div>
	);
}
