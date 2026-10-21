import Link from "next/link";
import ProductCard from "@/components/product/ProductCard";

export default function ProductRow({ title, products, viewAll }) {
	return (
		<section className="site-container py-8">
			<h2 className="mb-8 text-center text-[18px]">{title}</h2>

			<div
				className="
    -mx-4 flex snap-x snap-mandatory gap-[17px] overflow-x-auto px-4 pb-3
    scroll-px-4 [scrollbar-width:thin] [scrollbar-color:#8a8a8a_#e8e8e1]
    md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0 md:pb-0
    md:[scrollbar-width:none] md:[&::-webkit-scrollbar]:hidden
  "
			>
				{products.map((p) => (
					<div
						key={p.id}
						className="w-[35%] shrink-0 snap-start sm:w-[30%] md:w-auto md:min-w-0"
					>
						<ProductCard product={p} />
					</div>
				))}
			</div>

			{viewAll && (
				<div className="mt-10 flex justify-center">
					<Link
						href={viewAll.href}
						className={viewAll.variant === "sale" ? "btn-sale" : "btn-primary"}
					>
						{viewAll.label}
					</Link>
				</div>
			)}
		</section>
	);
}
