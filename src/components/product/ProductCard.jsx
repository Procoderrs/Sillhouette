import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import RevealImage from "@/components/ui/RevealImage";

const SIZES = "(min-width: 768px) 33vw, 72vw";
export default function ProductCard({ product: p, saleView = false }) {
	// Purane data (price, salePrice) aur naye data (variants) dono ke liye
	const variants = p.variants ?? [
		{ price: p.price, salePrice: p.salePrice, stock: 1 },
	];
	const isNew = p.isNew ?? p.badge === "new";

	// Stock wale sizes hi dikhayen, warna sab
	const list = variants.filter((v) => v.stock > 0);
	const usable = list.length ? list : variants;

	// Sale card sirf sale collection mein dikhega
	const saleVariants = usable.filter((v) => v.salePrice);
	const showSale = saleView && saleVariants.length > 0;

	const images = p.images ?? [];

	if (showSale) {
		// Sale collection: sab se sasti sale size ka old/new price aur uska discount
		const cheapest = saleVariants.reduce((a, b) =>
			b.salePrice < a.salePrice ? b : a,
		);
		const save = Math.round(
			((cheapest.price - cheapest.salePrice) / cheapest.price) * 100,
		);

		return (
			<Link href={`/products/${p.slug}?sale=1`} className="group block">
				<ImageBlock images={images} name={p.name} badge="Sale" />

				<div className="mt-3 text-center text-[13px] uppercase">
					<p>{p.name}</p>
					<p className="mt-1 flex flex-wrap justify-center gap-x-2">
						<span className="text-black/50 line-through">
							{formatPrice(cheapest.price)}
						</span>
						<span>{formatPrice(cheapest.salePrice)}</span>
						{save > 0 && <span className="text-sale">Save {save}%</span>}
					</p>
				</div>
			</Link>
		);
	}

	// Normal collections aur home page: regular price, range ho to "From"
	const prices = usable.map((v) => v.price);
	const minPrice = Math.min(...prices);
	const hasRange = new Set(prices).size > 1;

	return (
		<Link href={`/products/${p.slug}`} className="group block">
			<ImageBlock images={images} name={p.name} badge={isNew ? "New" : null} />

			<div className="mt-3 text-center text-[13px] uppercase">
				<p>{p.name}</p>
				<p className="mt-1">
					{hasRange && "From "}
					{formatPrice(minPrice)}
				</p>
			</div>
		</Link>
	);
}

// Image aur hover wali second image, dono cards mein same
function ImageBlock({ images, name, badge }) {
	if (images.length === 0) {
		return <div className="relative aspect-[3/4] bg-soft-2" />;
	}
	return (
		<div className="relative aspect-[3/4] overflow-hidden bg-soft-2">
			{badge && (
				<span className="absolute left-0 top-0 z-10 bg-black px-2 py-1 text-[11px] uppercase text-white">
					{badge}
				</span>
			)}

			<RevealImage
				src={images[0]}
				alt={name}
				sizes={SIZES}
				className="transition-opacity duration-300 group-hover:opacity-0"
			/>

			<RevealImage
				src={images[1] ?? images[0]}
				alt=""
				sizes={SIZES}
				className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			/>
		</div>
	);
}
