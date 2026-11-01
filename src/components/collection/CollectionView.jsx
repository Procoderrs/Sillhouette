"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product/ProductCard";
import { formatPrice } from "@/lib/utils";

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const SORTS = [
	{ value: "featured", label: "Featured" },
	{ value: "price_asc", label: "Price: low to high" },
	{ value: "price_desc", label: "Price: high to low" },
];

const EMPTY = { size: "", color: "", minPrice: "", maxPrice: "" };

function inStock(p) {
	return (p.variants ?? []).filter((v) => v.stock > 0);
}

function sizeOf(v) {
	return v.attributes?.find((a) => a.name === "Size")?.value;
}

// Product ki sab se kam price (sale view mein sale price)
function lowestPrice(p, saleView) {
	const prices = inStock(p).map((v) =>
		saleView && v.salePrice != null ? v.salePrice : v.price,
	);
	return prices.length ? Math.min(...prices) : null;
}

function sortSizes(list) {
	const rank = (s) => {
		const i = SIZE_ORDER.indexOf(s);
		return i === -1 ? 99 : i;
	};
	return [...list].sort((a, b) => rank(a) - rank(b));
}

function Chip({ active, onClick, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`border px-3 py-1.5 text-[12px] uppercase tracking-[0.1em] transition ${
				active
					? "border-black bg-black text-white"
					: "border-line hover:border-black"
			}`}
		>
			{children}
		</button>
	);
}

export default function CollectionView({
	title,
	note,
	saleView = false,
	products,
}) {
	const [filters, setFilters] = useState(EMPTY);
	const [sort, setSort] = useState("featured");

	// Facets is collection ke products se banti hain
	const facets = useMemo(() => {
		const sizes = new Set();
		const colors = new Set();
		let min = Infinity;
		let max = 0;

		products.forEach((p) => {
			const variants = inStock(p);
			if (variants.length === 0) return;

			variants.forEach((v) => {
				const s = sizeOf(v);
				if (s) sizes.add(s);
			});
			if (p.color) colors.add(p.color);

			const low = lowestPrice(p, saleView);
			if (low != null) {
				min = Math.min(min, low);
				max = Math.max(max, low);
			}
		});

		return {
			sizes: sortSizes([...sizes]),
			colors: [...colors].sort(),
			min: min === Infinity ? 0 : min,
			max,
		};
	}, [products, saleView]);

	const visible = useMemo(() => {
		const list = products.filter((p) => {
			const variants = inStock(p);
			if (variants.length === 0) return false;
			if (filters.color && p.color !== filters.color) return false;
			if (filters.size && !variants.some((v) => sizeOf(v) === filters.size))
				return false;

			const low = lowestPrice(p, saleView);
			if (filters.minPrice && low < Number(filters.minPrice)) return false;
			if (filters.maxPrice && low > Number(filters.maxPrice)) return false;
			return true;
		});

		if (sort === "price_asc") {
			list.sort((a, b) => lowestPrice(a, saleView) - lowestPrice(b, saleView));
		}
		if (sort === "price_desc") {
			list.sort((a, b) => lowestPrice(b, saleView) - lowestPrice(a, saleView));
		}
		return list;
	}, [products, filters, sort, saleView]);

	const hasFilters = Object.values(filters).some(Boolean);

	function toggle(key, value) {
		setFilters((prev) => ({
			...prev,
			[key]: prev[key] === value ? "" : value,
		}));
	}

	return (
		<section className="site-container py-10">
			<div className="mb-8 text-center">
				<h1 className="text-[22px] uppercase tracking-[0.15em]">{title}</h1>
				{note && <p className="mt-3 text-[13px] text-sale">{note}</p>}
			</div>

			<div className="grid gap-10 md:grid-cols-[220px_1fr]">
				<aside className="space-y-8">
					{facets.sizes.length > 0 && (
						<div className="space-y-3">
							<p className="text-[12px] uppercase tracking-[0.2em]">Size</p>
							<div className="flex flex-wrap gap-2">
								{facets.sizes.map((s) => (
									<Chip
										key={s}
										active={filters.size === s}
										onClick={() => toggle("size", s)}
									>
										{s}
									</Chip>
								))}
							</div>
						</div>
					)}

					{facets.colors.length > 0 && (
						<div className="space-y-3">
							<p className="text-[12px] uppercase tracking-[0.2em]">Color</p>
							<div className="flex flex-wrap gap-2">
								{facets.colors.map((c) => (
									<Chip
										key={c}
										active={filters.color === c}
										onClick={() => toggle("color", c)}
									>
										{c}
									</Chip>
								))}
							</div>
						</div>
					)}

					{facets.max > 0 && (
						<div className="space-y-3">
							<p className="text-[12px] uppercase tracking-[0.2em]">Price</p>
							<p className="text-[12px] text-neutral-500">
								{formatPrice(facets.min)} - {formatPrice(facets.max)}
							</p>
							<div className="flex gap-2">
								<input
									type="number"
									placeholder="Min"
									value={filters.minPrice}
									onChange={(e) =>
										setFilters((p) => ({ ...p, minPrice: e.target.value }))
									}
									className="w-full border border-neutral-300 px-3 py-2 text-[13px] outline-none focus:border-black"
								/>
								<input
									type="number"
									placeholder="Max"
									value={filters.maxPrice}
									onChange={(e) =>
										setFilters((p) => ({ ...p, maxPrice: e.target.value }))
									}
									className="w-full border border-neutral-300 px-3 py-2 text-[13px] outline-none focus:border-black"
								/>
							</div>
						</div>
					)}

					{hasFilters && (
						<button
							type="button"
							onClick={() => setFilters(EMPTY)}
							className="text-[12px] uppercase tracking-[0.12em] underline"
						>
							Clear all
						</button>
					)}
				</aside>

				<div>
					<div className="mb-6 flex flex-wrap items-center justify-between gap-4 text-[13px]">
						<p>{visible.length} products</p>
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value)}
							className="border border-neutral-300 bg-white px-3 py-2 outline-none focus:border-black"
						>
							{SORTS.map((s) => (
								<option key={s.value} value={s.value}>
									{s.label}
								</option>
							))}
						</select>
					</div>

					{visible.length === 0 ? (
						<p className="py-20 text-center text-[14px] text-neutral-500">
							Is filter ke saath koi product nahi mila.
						</p>
					) : (
						<div className="grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
							{visible.map((p) => (
								<ProductCard
									key={p._id ?? p.id}
									product={p}
									saleView={saleView}
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
