import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default function ProductCard({ product: p }) {
	const onSale = p.salePrice && p.salePrice < p.price;
	const off = onSale
		? Math.round(((p.price - p.salePrice) / p.price) * 100)
		: 0;
	const isSaleBadge = p.badge === "sale";

	return (
		<Link href={`/products/${p.slug}`} className="group block">
			<div className="relative aspect-[3/4] overflow-hidden bg-soft-2">
				{p.badge && (
					<span
						className={`absolute top-0 z-10 px-2 py-1 text-[11px] uppercase ${
							isSaleBadge ? " bg-black text-white" : " bg-soft-3 text-black"
						}`}
					>
						{isSaleBadge ? "Sale" : p.badge}
					</span>
				)}
				<Image
					src={p.images[0]}
					alt={p.name}
					fill
					sizes="(min-width: 1024px) 25vw, 50vw"
					className="object-cover transition-opacity duration-300 group-hover:opacity-0"
				/>
				<Image
					src={p.images[1]}
					alt=""
					fill
					sizes="(min-width: 1024px) 25vw, 50vw"
					className="object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
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
