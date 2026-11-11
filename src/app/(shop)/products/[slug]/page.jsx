import Link from "next/link";
import { notFound } from "next/navigation";
import ProductGallery from "@/components/product/ProductGallery";
import ProductPurchase from "@/components/product/ProductPurchase";
import ReviewSection from "@/components/product/Reviews";
import SimilarProducts from "@/components/product/SimilarProducts";
import { getProductBySlug } from "@/services/productService";
import { AppError } from "@/lib/errors";
import { getSettings } from "@/services/settingService";
import { listReviews } from "@/services/reviewService";
import { getCurrentUser } from "@/lib/session";
export default async function ProductPage({ params, searchParams }) {
	const { slug } = await params;
	const { sale } = await searchParams;
	const saleView = sale === "1";

	let product;
	try {
		product = await getProductBySlug(slug);
	} catch (error) {
		if (error instanceof AppError && error.status === 404) notFound();
		throw error;
	}

	// ObjectId aur Date client component mein direct nahi jate
	const plain = JSON.parse(JSON.stringify(product));
	const settings = JSON.parse(JSON.stringify(await getSettings()));
	const reviews = JSON.parse(
		JSON.stringify(await listReviews(String(product._id))),
	);
	const user = await getCurrentUser();

	return (
		<>
			<section className="site-container py-8 md:py-10">
				<nav className="mb-8 text-[11px] uppercase tracking-[0.12em] text-black/60">
					<Link href="/" className="hover:text-black">
						Home
					</Link>
					<span className="mx-2">&gt;</span>
					<span className="text-black">{plain.name}</span>
				</nav>

				<div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-16">
					<ProductGallery images={plain.images} name={plain.name} />

					<ProductPurchase
						product={plain}
						saleView={saleView}
						settings={settings}
					/>
				</div>
			</section>

			<section className="site-container pb-16">
				<ReviewSection
					productId={String(plain._id)}
					avgRating={plain.avgRating ?? 0}
					reviewCount={plain.reviewCount ?? 0}
					reviews={reviews}
				/>
			</section>

			<SimilarProducts products={[]} />
		</>
	);
}
