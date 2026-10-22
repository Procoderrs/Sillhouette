import ProductCard from "@/components/product/ProductCard";

export default function SimilarProducts({ products }) {
	if (!products.length) return null;

	return (
		<section className="site-container border-t border-line py-16">
			<h2 className="mb-10 text-center text-[24px] tracking-[0.2em]">
				SIMILAR PRODUCTS
			</h2>

			<div className="-mx-4 flex snap-x snap-mandatory gap-[17px] overflow-x-auto px-4 pb-3 md:mx-0 md:grid md:grid-cols-4 md:overflow-visible md:px-0">
				{products.map((p) => (
					<div
						key={p.id}
						className="w-[70%] shrink-0 snap-start sm:w-[45%] md:w-auto"
					>
						<ProductCard product={p} />
					</div>
				))}
			</div>
		</section>
	);
}
