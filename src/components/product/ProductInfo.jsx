"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa6";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";
import { formatPrice } from "@/lib/utils";

const EXPRESS_FEE = 8000;

function Accordion({ title, children }) {
	return (
		<details className="group border-b border-line py-4">
			<summary className="flex cursor-pointer list-none items-center justify-between text-[13px] uppercase tracking-[0.2em]">
				{title}
				<span className="text-[18px] group-open:rotate-45">+</span>
			</summary>
			<div className="mt-4 space-y-3 text-[14px] leading-relaxed">
				{children}
			</div>
		</details>
	);
}

export default function ProductInfo({ product, details }) {
	const router = useRouter();
	const addItem = useCartStore((s) => s.addItem);
	const setCartOpen = useCartDrawer((s) => s.setOpen);

	const [size, setSize] = useState(null);
	const [qty, setQty] = useState(1);
	const [express, setExpress] = useState(false);
	const [addon, setAddon] = useState(details.addons[0]);
	const [error, setError] = useState("");

	const basePrice = product.salePrice ?? product.price;

	// Cart mein item daalta hai. Agar size select nahi hai to error dikhata hai.
	function addToCart() {
		if (!size) {
			setError("Please select a size.");
			return false;
		}
		setError("");
		addItem({
			id: product.id,
			name: product.name,
			slug: product.slug,
			image: product.images[0],
			price: product.price,
			salePrice: product.salePrice,
			size,
			qty,
			express,
			addon,
		});
		return true;
	}

	function handleAddToCart() {
		if (addToCart()) setCartOpen(true);
	}

	function handleBuyNow() {
		if (addToCart()) router.push("/checkout");
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h1 className="text-[24px] uppercase tracking-[0.15em]">
					{product.name}
				</h1>
				<p className="mt-1 text-[12px] text-black/50">{details.sku}</p>
			</div>

			<div>
				<div className="flex items-center gap-3">
					<p className="text-[18px]">{formatPrice(basePrice)}</p>
					{product.salePrice && (
						<p className="text-[14px] text-black/50 line-through">
							{formatPrice(product.price)}
						</p>
					)}
				</div>
				<p className="mt-1 text-[13px] text-black/60">
					Shipping calculated at checkout.
				</p>
				<p className="mt-2 text-[13px]">Worldwide shipping available</p>
			</div>

			<div>
				<p className="text-[13px] uppercase tracking-[0.2em]">Size</p>
				<div className="mt-3 flex flex-wrap gap-2">
					{product.sizes.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => {
								setSize(s);
								setError("");
							}}
							className={`h-10 min-w-10 border px-3 text-[13px] ${
								size === s
									? "border-black bg-black text-white"
									: "border-line bg-white text-black"
							}`}
						>
							{s}
						</button>
					))}
				</div>
			</div>

			<div>
				<p className="mb-3 text-[13px] uppercase tracking-[0.2em]">
					Expedite order
				</p>
				<label className="flex cursor-pointer items-center gap-3 border border-line p-4 text-[12px] uppercase tracking-[0.15em]">
					<input
						type="checkbox"
						checked={express}
						onChange={(e) => setExpress(e.target.checked)}
						className="h-4 w-4 accent-black"
					/>
					Express shipping (5-6 working days) (+PKR {EXPRESS_FEE})
				</label>
			</div>

			<div>
				<p className="text-[13px] uppercase tracking-[0.2em]">
					You may also add
				</p>
				<div className="mt-3 space-y-2">
					{details.addons.map((a) => (
						<label
							key={a}
							className="flex cursor-pointer items-center gap-3 text-[12px] uppercase tracking-[0.15em]"
						>
							<input
								type="radio"
								name="addon"
								value={a}
								checked={addon === a}
								onChange={() => setAddon(a)}
								className="accent-black"
							/>
							{a}
						</label>
					))}
				</div>
			</div>

			<div className="flex w-fit items-center border border-line">
				<button
					type="button"
					onClick={() => setQty((q) => Math.max(1, q - 1))}
					className="px-4 py-3"
					aria-label="Decrease quantity"
				>
					<Minus size={14} />
				</button>
				<span className="px-4 text-[14px]">{qty}</span>
				<button
					type="button"
					onClick={() => setQty((q) => q + 1)}
					className="px-4 py-3"
					aria-label="Increase quantity"
				>
					<Plus size={14} />
				</button>
			</div>

			{error && <p className="text-[13px] text-sale">{error}</p>}

			<button
				type="button"
				onClick={handleAddToCart}
				className="btn-primary w-full"
			>
				Add to Cart
			</button>

			<button
				type="button"
				onClick={handleBuyNow}
				className="w-full border border-black py-3 text-[13px] uppercase tracking-[0.2em] hover:bg-black hover:text-white"
			>
				Buy it now
			</button>

			<p className="text-center text-[12px] text-black/60">
				We accept Google Pay and Apple Pay
			</p>

			<a
				href="https://wa.me/923310397865"
				target="_blank"
				rel="noopener noreferrer"
				className="flex items-center justify-center gap-3 bg-[#1f8a4c] py-3 text-[13px] uppercase tracking-[0.15em] text-white"
			>
				<FaWhatsapp size={18} />
				Chat with fashion consultant
			</a>

			<div className="text-[13px]">
				<p>
					<span className="font-semibold">Making time:</span>{" "}
					{details.makingTime}
				</p>
				<p>
					<span className="font-semibold">Transit time:</span>{" "}
					{details.transitTime}
				</p>
			</div>

			<div className="border-t border-line">
				<Accordion title="Description">
					<p>{details.description}</p>
				</Accordion>

				<Accordion title="Details">
					<p>
						<span className="font-semibold">Price includes:</span>{" "}
						{details.includes}
					</p>
					<p>
						<span className="font-semibold">Color:</span> {details.color}
					</p>
				</Accordion>

				<Accordion title="Fabric detail">
					<ul className="list-disc space-y-1 pl-5">
						{details.fabric.map((f) => (
							<li key={f}>{f}</li>
						))}
					</ul>
				</Accordion>

				<Accordion title="Customization">
					<ul className="list-disc space-y-1 pl-5">
						{details.customization.map((c) => (
							<li key={c}>{c}</li>
						))}
					</ul>
				</Accordion>

				<Accordion title="Size chart">
					<Image
						src="/chart.webp"
						alt="Size chart"
						width={600}
						height={900}
						className="h-auto w-full"
					/>
				</Accordion>

				<p className="pt-4 text-[12px] text-black/60">
					Note: Product color may slightly vary due to photographic lighting
					sources or your monitor setting.
				</p>
			</div>
		</div>
	);
}
