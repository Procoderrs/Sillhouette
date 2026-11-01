import Link from "next/link";
import { Home } from "lucide-react";
import ProductCard from "@/components/product/ProductCard";
import { Filters, SortSelect } from "@/components/collection/Filters";
import Pagination from "@/components/ui/Pagination";
import { products } from "@/data/products";
import { saleProducts } from "@/data/sale";
import { Suspense } from "react";
const PER_PAGE = 24;
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const uniq = (a) => [...new Set(a)];

async function CollectionContent({ params, searchParams }) {
	const { slug } = await params;
	const sp = await searchParams;

	const isSale = slug === "sale-1";
	const all = isSale
		? saleProducts
		: products.filter((p) => p.collection === slug);
	const price = (p) => p.salePrice ?? p.price;

	const prices = all.map(price);
	const priceBounds = {
		min: 0,
		max: Math.ceil(Math.max(...prices, 100) / 100) * 100,
	};

	const list = all
		.filter((p) => !sp.min || price(p) >= Number(sp.min))
		.filter((p) => !sp.max || price(p) <= Number(sp.max))
		.filter((p) => !sp.color || p.color === sp.color)
		.filter((p) => !sp.style || p.style === sp.style)
		.filter((p) => !sp.size || (p.sizes ?? []).includes(sp.size));

	const order = (a, b) => all.indexOf(a) - all.indexOf(b);
	const sorters = {
		az: (a, b) => a.name.localeCompare(b.name),
		za: (a, b) => b.name.localeCompare(a.name),
		low: (a, b) => price(a) - price(b),
		high: (a, b) => price(b) - price(a),
		old: order,
		new: (a, b) => order(b, a),
	};
	if (sorters[sp.sort]) list.sort(sorters[sp.sort]);

	const page = Math.max(1, Number(sp.page) || 1);
	const pages = Math.max(1, Math.ceil(list.length / PER_PAGE));
	const items = list.slice((page - 1) * PER_PAGE, page * PER_PAGE);

	const title = isSale ? "Sillhouete Sale" : slug.split("-").map(cap).join(" ");

	const groups = [
		{
			key: "size",
			title: "Size",
			options: uniq(all.flatMap((p) => p.sizes ?? [])).map((v) => ({
				label: v,
				value: v,
			})),
		},
		{
			key: "color",
			title: "Color",
			options: uniq(all.map((p) => p.color).filter(Boolean)).map((v) => ({
				label: cap(v),
				value: v,
			})),
		},
		{
			key: "style",
			title: "Dress Style",
			options: uniq(all.map((p) => p.style).filter(Boolean)).map((v) => ({
				label: cap(v),
				value: v,
			})),
		},
	];

	const { page: _page, ...query } = sp;

	return (
		<section className="site-container py-12">
			<h1 className="text-center text-[24px]">{title}</h1>

			<nav className="mt-10 flex items-center gap-2 text-[14px]">
				<Link href="/" aria-label="Home">
					<Home size={18} strokeWidth={1.5} />
				</Link>
				<span>/</span>
				<span>{title}</span>
			</nav>

			{isSale && (
				<p className="mt-8 text-[15px]">
					Sales items will not be return, exchange or refunded.
				</p>
			)}

			<div className="mt-8 flex items-center justify-between gap-4">
				<Filters groups={groups} priceBounds={priceBounds} />
				<SortSelect />
			</div>

			<p className="mt-6 text-[15px]">{list.length} products</p>

			{items.length ? (
				<div className="mt-6 grid grid-cols-2 gap-x-4.25 gap-y-10 lg:grid-cols-4">
					{items.map((p) => (
						<ProductCard key={p.id} product={p} />
					))}
				</div>
			) : (
				<p className="mt-10 text-center text-[15px]">No products found.</p>
			)}

			<Pagination
				page={page}
				pages={pages}
				query={query}
				basePath={`/collections/${slug}`}
			/>
		</section>
	);
}
export default function CollectionPage(props) {
	return (
		<Suspense fallback={<div className="site-container py-24" />}>
			<CollectionContent {...props} />
		</Suspense>
	);
}
