"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa6";
import { RiGlobalLine, RiRulerLine } from "react-icons/ri";
import { formatPrice } from "@/lib/utils";
import ProductDetails from "@/components/product/ProductDetails";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";

function attrsToSelection(attributes) {
	return Object.fromEntries(attributes.map((a) => [a.name, a.value]));
}

function variantLabel(v) {
	return v.attributes.map((a) => a.value).join(" / ");
}

function matches(v, selected) {
	return v.attributes.every((a) => selected[a.name] === a.value);
}

const sectionLabel = "text-[12px] font-medium uppercase tracking-[0.25em]";

export default function ProductPurchase({ product, saleView, settings }) {
	const router = useRouter();
	const addItem = useCartStore((s) => s.addItem);
	const setDrawerOpen = useCartDrawer((s) => s.setOpen);

	const variants = product.variants ?? [];
	const options = product.options ?? [];
	const choiceGroups = product.choiceGroups ?? [];

	const [selected, setSelected] = useState(() => {
		const first = variants.find((v) => v.stock > 0) ?? variants[0];
		return first ? attrsToSelection(first.attributes) : {};
	});
	const [choices, setChoices] = useState(() =>
		Object.fromEntries(choiceGroups.map((g) => [g.title, g.choices[0]])),
	);
	const [express, setExpress] = useState(false);
	const [qty, setQty] = useState(1);

	const variant = useMemo(
		() => variants.find((v) => matches(v, selected)) ?? null,
		[variants, selected],
	);

	const inStock = (variant?.stock ?? 0) > 0;
	const onSale = Boolean(
		saleView && product.onSale && variant?.salePrice != null,
	);
	const currentPrice = onSale ? variant.salePrice : (variant?.price ?? 0);
	const percentOff = onSale
		? Math.round(((variant.price - variant.salePrice) / variant.price) * 100)
		: 0;

	function valueAvailable(name, value) {
		return variants.some(
			(v) =>
				v.stock > 0 &&
				v.attributes.some((a) => a.name === name && a.value === value),
		);
	}

	function pick(name, value) {
		const next = { ...selected, [name]: value };
		const exact = variants.find((v) => matches(v, next));
		if (exact && exact.stock > 0) {
			setSelected(next);
			setQty(1);
			return;
		}
		const fallback = variants.find(
			(v) =>
				v.stock > 0 &&
				v.attributes.some((a) => a.name === name && a.value === value),
		);
		if (fallback) {
			setSelected(attrsToSelection(fallback.attributes));
			setQty(1);
		}
	}

	function buildCartItem() {
		return {
			productId: String(product._id),
			slug: product.slug,
			name: product.name,
			image: product.images?.[0] ?? "",
			attributes: variant.attributes.map(({ name, value }) => ({
				name,
				value,
			})),
			qty,
			express,
			choices: Object.entries(choices).map(([title, value]) => ({
				title,
				value,
			})),
		};
	}

	function handleAddToCart() {
		if (!inStock) return;
		addItem(buildCartItem());
		setDrawerOpen(true);
	}

	function handleBuyNow() {
		if (!inStock) return;
		addItem(buildCartItem());
		router.push("/checkout");
	}

	const whatsappText = `Hi, I want to ask about ${product.name} (${variant?.sku ?? ""}${
		variant ? `, ${variantLabel(variant)}` : ""
	})`;
	const whatsappLink = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(whatsappText)}`;

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-[26px] font-semibold uppercase tracking-[0.08em]">
					{product.name}
				</h1>
				{variant && (
					<p className="mt-2 text-[11px] uppercase tracking-[0.2em] text-neutral-500">
						{variant.sku}
					</p>
				)}
			</div>

			<div className="space-y-1">
				{onSale ? (
					<>
						<p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-sale">
							Save {percentOff}%
						</p>
						<div className="flex items-center gap-3 text-[20px]">
							<span className="text-neutral-400 line-through">
								{formatPrice(variant.price)}
							</span>
							<span className="text-neutral-300">|</span>
							<span className="font-semibold">
								{formatPrice(variant.salePrice)}
							</span>
						</div>
					</>
				) : (
					<p className="text-[20px] font-semibold">
						{formatPrice(currentPrice)}
					</p>
				)}
				<p className="text-[13px]">{settings.shippingNote}</p>
			</div>

			<div className="flex items-center gap-2 text-[15px]">
				<RiGlobalLine size={20} />
				<span>World Wide Shipping</span>
			</div>

			{options.map((o) => (
				<div key={o.name} className="space-y-3">
					<div className="flex items-center justify-between">
						<p className={sectionLabel}>{o.name}</p>
						{o.name.toLowerCase() === "size" && product.sizeChartImage && (
							<a
								href={product.sizeChartImage}
								target="_blank"
								rel="noreferrer"
								className="flex items-center gap-2 text-[14px] font-semibold uppercase tracking-[0.2em] underline underline-offset-4"
							>
								<RiRulerLine size={18} />
								Size Chart
							</a>
						)}
					</div>
					<div className="flex flex-wrap gap-2">
						{o.values.map((value) => {
							const active = selected[o.name] === value;
							const available = valueAvailable(o.name, value);
							return (
								<button
									key={value}
									type="button"
									disabled={!available}
									onClick={() => pick(o.name, value)}
									className={`min-w-[52px] border px-4 py-2.5 text-[13px] font-semibold uppercase tracking-[0.1em] transition ${
										active ? "border-2 border-black" : "border-line"
									} ${
										!available
											? "cursor-not-allowed text-neutral-300 line-through"
											: "hover:border-black"
									}`}
								>
									{value}
								</button>
							);
						})}
					</div>
				</div>
			))}

			{choiceGroups.map((g) => (
				<div key={g.title} className="space-y-3">
					<p className={sectionLabel}>{g.title}</p>
					<div className="space-y-2">
						{g.choices.map((c) => (
							<label
								key={c}
								className="flex cursor-pointer items-center gap-3 text-[14px]"
							>
								<input
									type="radio"
									name={g.title}
									checked={choices[g.title] === c}
									onChange={() =>
										setChoices((prev) => ({ ...prev, [g.title]: c }))
									}
									className="accent-black"
								/>
								{c}
							</label>
						))}
					</div>
				</div>
			))}

			{product.expressAllowed && (
				<div className="space-y-3">
					<p className={sectionLabel}>Expedite Order</p>
					<label className="flex cursor-pointer items-center gap-4 border border-line bg-white px-5 py-5 text-[13px] font-medium uppercase tracking-[0.2em]">
						<input
							type="checkbox"
							checked={express}
							onChange={(e) => setExpress(e.target.checked)}
							className="h-4 w-4 accent-black"
						/>
						Express-shipping ({settings.expressDays}) [+
						{formatPrice(settings.expressFee)}]{" "}
					</label>
				</div>
			)}

			<div className="flex items-center gap-4">
				<div className="flex items-center rounded-full border border-line">
					<button
						type="button"
						onClick={() => setQty((q) => Math.max(1, q - 1))}
						className="h-10 w-10 text-[18px]"
					>
						-
					</button>
					<span className="w-8 text-center text-[14px]">{qty}</span>
					<button
						type="button"
						onClick={() => setQty((q) => Math.min(variant?.stock ?? 1, q + 1))}
						className="h-10 w-10 text-[18px]"
					>
						+
					</button>
				</div>
			</div>

			{!inStock && (
				<p className="text-[13px] text-sale">
					This combination is out of stock.
				</p>
			)}

			<div className="space-y-3">
				<button
					type="button"
					onClick={handleAddToCart}
					disabled={!inStock}
					className="btn-primary w-full hover:bg-transparent hover:text-black disabled:opacity-40"
				>
					Add to cart
				</button>
				<button
					type="button"
					onClick={handleBuyNow}
					disabled={!inStock}
					className="w-full border border-black py-3.5 text-[13px] font-extrabold uppercase tracking-[0.3em] transition disabled:opacity-40"
				>
					Buy it now
				</button>
			</div>

			<div className="flex  justify-center flex-wrap items-center gap-3 text-[13px]">
				<span>We accept</span>
				<img src="/gpay.svg" alt="Google Pay" className="h-6 w-auto" />
				<img src="/applepay.svg" alt="Apple Pay" className="h-6 w-auto" />
			</div>

			{settings.whatsappNumber && (
				<a
					href={whatsappLink}
					target="_blank"
					rel="noreferrer"
					className="flex w-full items-center justify-center gap-3 bg-[#1f9e4f] py-3.5 text-[12px] font-bold uppercase tracking-[0.25em] text-white transition hover:opacity-90"
				>
					<FaWhatsapp size={18} />
					Chat with fashion consultant
				</a>
			)}
			<div className="space-y-6 border-t border-line pt-8">
				<ProductDetails text={product.description} />
				<ProductDetails text={product.readyMadeDetails} />
				<ProductDetails text={product.unstitchedDetails} />
			</div>
		</div>
	);
}
