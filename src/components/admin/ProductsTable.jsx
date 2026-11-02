"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const head =
	"px-3 py-2 text-left text-[12px] uppercase tracking-[0.1em] font-normal text-neutral-500";
const cell = "px-3 py-3 align-middle text-[14px]";

// "best-sellers" -> "Best Sellers"
function prettify(slug) {
	if (!slug) return "-";
	return slug
		.split("-")
		.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
		.join(" ");
}

function priceText(p) {
	const prices = (p.variants || [])
		.map((v) => Number(v.price))
		.filter((n) => !Number.isNaN(n));

	if (prices.length === 0) return "-";

	const min = Math.min(...prices);
	const max = Math.max(...prices);
	if (min === max) return formatPrice(min);
	return `${formatPrice(min)} - ${formatPrice(max)}`;
}
function totalStock(p) {
	return (p.variants ?? []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
}

function Badge({ children, tone }) {
	const tones = {
		new: "bg-black text-white",
		sale: "bg-sale text-white",
		hidden: "bg-neutral-300 text-neutral-800",
	};
	return (
		<span
			className={`mr-1 inline-block px-2 py-0.5 text-[11px] uppercase tracking-[0.08em] ${tones[tone]}`}
		>
			{children}
		</span>
	);
}

export default function ProductsTable() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [query, setQuery] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const res = await fetch("/api/admin/products", { cache: "no-store" });
				const data = await res.json();
				if (!res.ok) throw new Error(data.message || "Could not load products");
				if (!cancelled) setProducts(data.data);
			} catch (err) {
				if (!cancelled) setError(err.message);
			} finally {
				if (!cancelled) setLoading(false);
			}
		}

		load();
		return () => {
			cancelled = true;
		};
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) return products;
		return products.filter(
			(p) =>
				p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q),
		);
	}, [products, query]);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<input
					className="w-full max-w-xs border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black"
					placeholder="Search by name or SKU"
					value={query}
					onChange={(e) => setQuery(e.target.value)}
				/>
				<p className="text-[13px] text-neutral-500">
					{filtered.length} product{filtered.length === 1 ? "" : "s"}
				</p>
			</div>

			{error && <p className="text-[14px] text-sale">{error}</p>}
			{loading && <p className="text-[14px] text-neutral-500">Loading...</p>}

			{!loading && !error && (
				<div className="overflow-x-auto border border-line bg-white">
					<table className="w-full border-collapse">
						<thead className="border-b border-line bg-soft-2">
							<tr>
								<th className={head}>Image</th>
								<th className={head}>Product</th>
								<th className={head}>Parent</th>
								<th className={head}>Child</th>
								<th className={head}>Price</th>
								<th className={head}>Stock</th>
								<th className={head}>Badges</th>
								<th className={head}></th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((p) => (
								<tr key={p._id} className="border-b border-line">
									<td className={cell}>
										{p.images?.[0] ? (
											<img
												src={p.images[0]}
												alt={p.name}
												className="h-16 w-12 object-cover bg-soft-2"
											/>
										) : (
											<div className="h-16 w-12 bg-soft-2" />
										)}
									</td>
									<td className={cell}>
										<p>{p.name}</p>
										<p className="text-[12px] text-neutral-500">{p.sku}</p>
									</td>
									<td className={cell}>{prettify(p.collection)}</td>
									<td className={cell}>{prettify(p.childCollection)}</td>
									<td className={cell}>{priceText(p)}</td>
									<td className={cell}>{totalStock(p)}</td>
									<td className={cell}>
										{p.isNew && <Badge tone="new">New</Badge>}
										{p.onSale && <Badge tone="sale">Sale</Badge>}
										{!p.isActive && <Badge tone="hidden">Hidden</Badge>}
									</td>
									<td className={cell}>
										<Link
											href={`/admin/products/${p._id}`}
											className="text-[13px] underline"
										>
											Edit
										</Link>
									</td>
								</tr>
							))}
							{filtered.length === 0 && (
								<tr>
									<td
										colSpan={8}
										className="px-3 py-6 text-center text-[14px] text-neutral-500"
									>
										No products found.
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
