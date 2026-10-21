"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import PriceSlider from "@/components/collection/PriceSlider";

function Group({ group, selected, onPick }) {
	const [open, setOpen] = useState(true);

	return (
		<div className="border-b border-line py-5">
			<button
				type="button"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				className="flex w-full items-center justify-between text-[13px] uppercase tracking-[0.25em]"
			>
				{group.title}
				<ChevronDown
					size={16}
					className={`transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="mt-4 flex flex-wrap gap-2">
					{group.options.map((o) => {
						const active = selected === o.value;
						return (
							<button
								key={o.value}
								type="button"
								onClick={() => onPick(group.key, o.value)}
								className={`border px-3 py-1.5 text-[12px] uppercase ${
									active
										? "border-black bg-black text-white"
										: "border-line bg-white text-black"
								}`}
							>
								{o.label}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

export function Filters({ groups, priceBounds }) {
	const [open, setOpen] = useState(false);
	const router = useRouter();
	const pathname = usePathname();
	const sp = useSearchParams();

	const filterKeys = ["min", "max", ...groups.map((g) => g.key)];
	const count = filterKeys.filter((k) => sp.get(k)).length;

	function go(q) {
		const s = q.toString();
		router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
	}

	function pick(key, value) {
		const q = new URLSearchParams(sp.toString());
		if (q.get(key) === value) q.delete(key);
		else q.set(key, value);
		q.delete("page");
		go(q);
	}

	function clearAll() {
		const q = new URLSearchParams();
		if (sp.get("sort")) q.set("sort", sp.get("sort"));
		go(q);
	}

	return (
		<>
			<button
				type="button"
				onClick={() => setOpen(true)}
				className={`flex items-center gap-3 border px-6 py-3 text-[15px] ${
					count
						? "border-black bg-black text-white"
						: "border-line bg-white text-black"
				}`}
			>
				<SlidersHorizontal size={18} strokeWidth={1.5} />
				Filter{count ? ` (${count})` : ""}
			</button>

			{open && (
				<div className="fixed inset-0 z-50">
					<div
						className="absolute inset-0 bg-black/40"
						onClick={() => setOpen(false)}
					/>

					<aside className="absolute inset-y-0 left-0 flex w-[340px] max-w-full flex-col bg-white">
						<div className="flex items-center justify-between border-b border-line px-6 py-5">
							<h2 className="text-[15px] uppercase tracking-[0.25em]">
								Filter
							</h2>
							<button
								type="button"
								aria-label="Close filters"
								onClick={() => setOpen(false)}
							>
								<X size={22} strokeWidth={1.5} />
							</button>
						</div>

						<div className="flex-1 overflow-y-auto px-6">
							<PriceSlider
								key={`${sp.get("min")}-${sp.get("max")}`}
								min={priceBounds.min}
								max={priceBounds.max}
							/>
							{groups.map((g) => (
								<Group
									key={g.key}
									group={g}
									selected={sp.get(g.key)}
									onPick={pick}
								/>
							))}
						</div>

						<div className="flex gap-3 border-t border-line p-6">
							<button
								type="button"
								onClick={clearAll}
								className="flex-1 border border-line py-3 text-[13px] uppercase tracking-[0.2em]"
							>
								Clear all
							</button>
							<button
								type="button"
								onClick={() => setOpen(false)}
								className="btn-primary flex-1 text-center"
							>
								Show results
							</button>
						</div>
					</aside>
				</div>
			)}
		</>
	);
}

export function SortSelect() {
	const router = useRouter();
	const pathname = usePathname();
	const sp = useSearchParams();

	function change(e) {
		const q = new URLSearchParams(sp.toString());
		if (e.target.value) q.set("sort", e.target.value);
		else q.delete("sort");
		q.delete("page");
		const s = q.toString();
		router.push(s ? `${pathname}?${s}` : pathname, { scroll: false });
	}

	return (
		<select
			value={sp.get("sort") ?? ""}
			onChange={change}
			className="border border-line bg-white px-4 py-3 text-[14px] outline-none"
		>
			<option value="">Featured</option>
			<option value="best">Best selling</option>
			<option value="az">Alphabetically, A-Z</option>
			<option value="za">Alphabetically, Z-A</option>
			<option value="low">Price, low to high</option>
			<option value="high">Price, high to low</option>
			<option value="old">Date, old to new</option>
			<option value="new">Date, new to old</option>
		</select>
	);
}
