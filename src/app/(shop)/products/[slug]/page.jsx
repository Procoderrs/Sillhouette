import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { defaultDetails, productDetails } from "@/data/productDetails";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import Reviews from "@/components/product/Reviews";
import SimilarProducts from "@/components/product/SimilarProducts";

export default async function ProductPage({ params }) {
	const { slug } = await params;

	const product = products.find((p) => p.slug === slug);
	if (!product) notFound();

	const details = {
		...defaultDetails,
		...productDetails[slug],
		sku: product.slug.toUpperCase(),
	};

	const similar = products
		.filter((p) => p.collection === product.collection && p.slug !== slug)
		.slice(0, 4);

	return (
		<>
			<section className="site-container py-10">
				<nav className="mb-8 text-[12px] text-black/60">
					<Link href="/" className="hover:text-black">
						Home
					</Link>{" "}
					/ <span className="text-black">{product.name}</span>
				</nav>

				<div className="grid gap-10 md:grid-cols-2">
					<ProductGallery images={product.images} name={product.name} />
					<ProductInfo product={product} details={details} />
				</div>
			</section>

			<Reviews />
			<SimilarProducts products={similar} />
		</>
	);
}
