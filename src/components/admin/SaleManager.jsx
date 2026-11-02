"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

function range(values) {
	const nums = values.filter((n) => n != null);
	if (nums.length === 0) return "-";
	const min = Math.min(...nums);
	const max = Math.max(...nums);
	return min === max
		? formatPrice(min)
		: `${formatPrice(min)} - ${formatPrice(max)}`;
}

export default function SaleManager() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState("on");
	const [busyId, setBusyId] = useState(null);
	const [error, setError] = useState("");

	useEffect(() => {
		let cancelled = false;

		async function load() {
			try {
				const res = await fetch("/api/admin/products", { cache: "no-store" });
				const data = await res.json();
				if (!res.ok)
					throw new Error(data.message || "Products could not be loaded");
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

	async function toggleSale(product) {
		setError("");
		setBusyId(product._id);

		try {
			const res = await fetch(`/api/admin/products/${product._id}/sale`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ onSale: !product.onSale }),
			});
			const data = await res.json();
			if (!res.ok) throw new Error(data.message || "Sale could not be updated");

			setProducts((prev) =>
				prev.map((p) => (p._id === product._id ? data.data : p)),
			);
		} catch (err) {
			setError(err.message);
		} finally {
			setBusyId(null);
		}
	}

	const visible = filter === "on" ? products.filter((p) => p.onSale) : products;

	return (
		<div className="max-w-6xl space-y-6">
			<div className="flex flex-wrap items-end justify-between gap-4">
				<div>
					<p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
						Admin
					</p>
					<h1 className="mt-1 text-[24px] uppercase tracking-[0.15em]">Sale</h1>
				</div>

				<div className="flex gap-2">
					{[
						{ value: "on", label: "On sale" },
						{ value: "all", label: "All products" },
					].map((t) => (
						<button
							key={t.value}
							type="button"
							onClick={() => setFilter(t.value)}
							className={`border px-4 py-2 text-[12px] uppercase tracking-[0.12em] ${
								filter === t.value
									? "border-black bg-black text-white"
									: "border-line"
							}`}
						>
							{t.label}
						</button>
					))}
				</div>
			</div>

			{error && <p className="text-[14px] text-sale">{error}</p>}

			{loading ? (
				<p className="text-[14px] text-neutral-500">Loading...</p>
			) : visible.length === 0 ? (
				<p className="text-[14px] text-neutral-500">
					{filter === "on"
						? "No products are on sale right now."
						: "No products found."}
				</p>
			) : (
				<div className="overflow-x-auto border border-line bg-white">
					<table className="w-full border-collapse text-[14px]">
						<thead>
							<tr className="border-b border-line text-left text-[12px] uppercase tracking-[0.12em] text-neutral-500">
								<th className="px-4 py-3">Product</th>
								<th className="px-4 py-3">Regular price</th>
								<th className="px-4 py-3">Sale price</th>
								<th className="px-4 py-3">Sale</th>
								<th className="px-4 py-3"></th>
							</tr>
						</thead>
						<tbody>
							{visible.map((p) => {
								const regular = p.variants.map((v) => v.price);
								const sale = p.variants.map((v) => v.salePrice);
								return (
									<tr key={p._id} className="border-b border-line align-middle">
										<td className="px-4 py-3">
											<p>{p.name}</p>
											<p className="text-[12px] text-neutral-500">{p.sku}</p>
										</td>
										<td className="px-4 py-3">{range(regular)}</td>
										<td className="px-4 py-3">
											{p.onSale ? range(sale) : "-"}
										</td>
										<td className="px-4 py-3">
											<button
												type="button"
												disabled={busyId === p._id}
												onClick={() => toggleSale(p)}
												className={`min-w-[64px] border px-3 py-1.5 text-[12px] uppercase tracking-[0.12em] disabled:opacity-50 ${
													p.onSale ? "border-sale text-sale" : "border-line"
												}`}
											>
												{p.onSale ? "On" : "Off"}
											</button>
										</td>
										<td className="px-4 py-3">
											<Link
												href={`/admin/products/${p._id}`}
												className="underline"
											>
												Edit
											</Link>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
