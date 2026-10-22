import ProductCard from "@/components/product/ProductCard";
import { products } from "@/data/products";

export const metadata = {
	title: "Search | Silhouette",
};

export default async function SearchPage({ searchParams }) {
	const sp = await searchParams;
	const q = String(sp.q ?? "").trim();

	const results = q
		? products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()))
		: [];

	return (
		<section className="site-container py-12">
			<h1 className="mb-8 text-center text-[24px] tracking-[0.2em]">SEARCH</h1>

			<form action="/search" className="mx-auto mb-10 flex max-w-md">
				<input
					name="q"
					defaultValue={q}
					placeholder="Search products"
					className="flex-1 border border-line px-4 py-3 outline-none focus:border-black"
				/>
				<button type="submit" className="btn-primary px-6">
					Search
				</button>
			</form>

			{q && (
				<p className="mb-6 text-center text-[15px]">
					{results.length} results for &quot;{q}&quot;
				</p>
			)}

			{results.length > 0 && (
				<div className="grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
					{results.map((p) => (
						<ProductCard key={p.id} product={p} />
					))}
				</div>
			)}
		</section>
	);
}
