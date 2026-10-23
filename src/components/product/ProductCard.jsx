import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import RevealImage from "@/components/ui/RevealImage";

const SIZES = "(min-width: 1024px) 25vw, 50vw";

export default function ProductCard({ product: p }) {
	const onSale = p.salePrice && p.salePrice < p.price;
	const off = onSale
		? Math.round(((p.price - p.salePrice) / p.price) * 100)
		: 0;
	const isSaleBadge = p.badge === "sale";

	return (
		<Link href={`/products/${p.slug}`} className="group block">
			<div className="relative aspect-3/4 overflow-hidden bg-soft-2">
				{p.badge && (
					<span
						className={`absolute top-0 z-10 px-2 py-1 text-[11px] uppercase ${
							isSaleBadge ? "bg-black text-white" : "bg-soft-3 text-black"
						}`}
					>
						{isSaleBadge ? "Sale" : p.badge}
					</span>
				)}

				{/* Pehli image: hover par fade out */}
				<RevealImage
					src={p.images[0]}
					alt={p.name}
					sizes={SIZES}
					className="transition-opacity duration-300 group-hover:opacity-0"
				/>

				{/* Doosri image: hover par fade in */}
				<RevealImage
					src={p.images[1]}
					alt=""
					sizes={SIZES}
					className="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
				/>
			</div>

			<div className="mt-3 text-center text-[13px] uppercase">
				<p>{p.name}</p>
				<p className="mt-1 flex flex-wrap justify-center gap-x-2">
					{p.from && <span>From</span>}
					{onSale ? (
						<>
							<span className="text-black/50 line-through">
								{formatPrice(p.price)}
							</span>
							<span>{formatPrice(p.salePrice)}</span>
							<span className="text-sale">Save {off}%</span>
						</>
					) : (
						<span className="text-price">{formatPrice(p.price)}</span>
					)}
				</p>
			</div>
		</Link>
	);
}
