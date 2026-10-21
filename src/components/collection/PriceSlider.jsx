"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";

const STEP = 100;

export default function PriceSlider({ min, max }) {
	const router = useRouter();
	const pathname = usePathname();
	const sp = useSearchParams();

	const [low, setLow] = useState(Number(sp.get("min")) || min);
	const [high, setHigh] = useState(Number(sp.get("max")) || max);
	const mounted = useRef(false);

	// Drag khatam hone ke 400ms baad URL update hoga
	useEffect(() => {
		if (!mounted.current) {
			mounted.current = true;
			return;
		}
		const t = setTimeout(() => {
			const q = new URLSearchParams(sp.toString());
			if (low <= min) q.delete("min");
			else q.set("min", String(low));
			if (high >= max) q.delete("max");
			else q.set("max", String(high));
			q.delete("page");
			const s = q.toString();
			router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
		}, 400);
		return () => clearTimeout(t);
	}, [low, high]);

	const pct = (v) => ((v - min) / (max - min || 1)) * 100;
	const onLow = (e) => setLow(Math.min(Number(e.target.value), high - STEP));
	const onHigh = (e) => setHigh(Math.max(Number(e.target.value), low + STEP));

	return (
		<div className="border-b border-line py-5">
			<p className="text-[13px] uppercase tracking-[0.25em]">Price</p>

			<div className="relative mt-6 h-4">
				<div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 bg-black/15" />
				<div
					className="absolute top-1/2 h-[3px] -translate-y-1/2 bg-black"
					style={{ left: `${pct(low)}%`, right: `${100 - pct(high)}%` }}
				/>
				<input
					type="range"
					min={min}
					max={max}
					step={STEP}
					value={low}
					onChange={onLow}
					aria-label="Minimum price"
					className="price-range"
				/>
				<input
					type="range"
					min={min}
					max={max}
					step={STEP}
					value={high}
					onChange={onHigh}
					aria-label="Maximum price"
					className="price-range"
				/>
			</div>

			<div className="mt-5 flex justify-between text-[14px]">
				<span>{formatPrice(low)}</span>
				<span>{formatPrice(high)}</span>
			</div>
		</div>
	);
}
