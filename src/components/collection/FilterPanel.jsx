"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { formatPrice } from "@/lib/utils";

// Dummy options: baad mein ye backend se aayenge (colors ka admin mein define hona)
const COLORS = [
	{ name: "Red", hex: "#9B1B30" },
	{ name: "Maroon", hex: "#5C0A1A" },
	{ name: "Gold", hex: "#C9A227" },
	{ name: "Green", hex: "#2F5D50" },
	{ name: "Blue", hex: "#1F3A5F" },
	{ name: "Black", hex: "#111111" },
	{ name: "White", hex: "#F5F5F0" },
	{ name: "Pink", hex: "#E8B4BC" },
];

const SIZES = ["Unstitched", "XS", "S", "M", "L", "XL"];
const STYLES = ["Straight", "Anarkali", "Lehenga", "Sharara"];

const numberField =
	"w-full border border-neutral-300 px-3 py-2 text-[14px] outline-none focus:border-black";

function Section({ title, open, onToggle, children }) {
	return (
		<div className="border-b border-line py-5">
			<button
				type="button"
				onClick={onToggle}
				className="flex w-full items-center justify-between text-[13px] uppercase tracking-[0.2em]"
			>
				{title}
				<ChevronDown
					size={16}
					className={`transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>
			{open && <div className="mt-4">{children}</div>}
		</div>
	);
}

export default function FilterPanel({ maxPrice = 0, onChange }) {
	const [open, setOpen] = useState({
		price: true,
		size: true,
		color: true,
		style: true,
	});
	const [filters, setFilters] = useState({
		minPrice: 0,
		maxPrice,
		size: null,
		color: null,
		style: null,
	});

	const activeCount =
		(filters.size ? 1 : 0) +
		(filters.color ? 1 : 0) +
		(filters.style ? 1 : 0) +
		(filters.minPrice > 0 || filters.maxPrice < maxPrice ? 1 : 0);

	function update(patch) {
		setFilters((prev) => {
			const next = { ...prev, ...patch };
			onChange?.(next);
			return next;
		});
	}

	function clearAll() {
		const reset = {
			minPrice: 0,
			maxPrice,
			size: null,
			color: null,
			style: null,
		};
		setFilters(reset);
		onChange?.(reset);
	}

	const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

	return (
		<aside className="w-full md:w-60">
			<div className="flex items-center justify-between pb-4">
				<p className="text-[13px] uppercase tracking-[0.2em]">Filters</p>
				{activeCount > 0 && (
					<button
						type="button"
						onClick={clearAll}
						className="text-[12px] underline"
					>
						Clear all ({activeCount})
					</button>
				)}
			</div>

			{/* PRICE */}
			<Section title="Price" open={open.price} onToggle={() => toggle("price")}>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<label className="mb-1 block text-[12px] uppercase tracking-[0.1em]">
							Min
						</label>
						<input
							type="number"
							min={0}
							max={filters.maxPrice}
							className={numberField}
							value={filters.minPrice}
							onChange={(e) =>
								update({ minPrice: Math.max(0, Number(e.target.value)) })
							}
						/>
					</div>
					<div>
						<label className="mb-1 block text-[12px] uppercase tracking-[0.1em]">
							Max
						</label>
						<input
							type="number"
							min={filters.minPrice}
							max={maxPrice}
							className={numberField}
							value={filters.maxPrice}
							onChange={(e) =>
								update({ maxPrice: Math.min(maxPrice, Number(e.target.value)) })
							}
						/>
					</div>
				</div>
				<p className="mt-2 text-[12px] text-neutral-500">
					{formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
				</p>
			</Section>

			{/* SIZE */}
			<Section title="Size" open={open.size} onToggle={() => toggle("size")}>
				<div className="flex flex-wrap gap-2">
					{SIZES.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => update({ size: filters.size === s ? null : s })}
							className={`border px-3 py-1.5 text-[12px] uppercase ${
								filters.size === s
									? "border-black bg-black text-white"
									: "border-neutral-300"
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</Section>

			{/* COLOR */}
			<Section
				title="Colour"
				open={open.color}
				onToggle={() => toggle("color")}
			>
				<div className="flex flex-wrap gap-3">
					{COLORS.map((c) => (
						<button
							key={c.name}
							type="button"
							title={c.name}
							aria-label={c.name}
							onClick={() =>
								update({ color: filters.color === c.name ? null : c.name })
							}
							className={`h-7 w-7 rounded-full border border-neutral-300 ${
								filters.color === c.name
									? "ring-2 ring-black ring-offset-2"
									: ""
							}`}
							style={{ backgroundColor: c.hex }}
						/>
					))}
				</div>
			</Section>

			{/* DRESS STYLE */}
			<Section
				title="Dress style"
				open={open.style}
				onToggle={() => toggle("style")}
			>
				<div className="flex flex-wrap gap-2">
					{STYLES.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => update({ style: filters.style === s ? null : s })}
							className={`border px-3 py-1.5 text-[12px] uppercase ${
								filters.style === s
									? "border-black bg-black text-white"
									: "border-neutral-300"
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</Section>
		</aside>
	);
}
