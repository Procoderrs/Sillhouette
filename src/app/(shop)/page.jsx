import HeroSlider from "@/components/home/HeroSlider";
import ProductRow from "@/components/home/ProductRow";
import ShowcaseGrid from "@/components/home/ShowcaseGrid";
import ShopByEvent from "@/components/home/ShopByEvent";
import InstagramGrid from "@/components/home/InstagramGrid";
import Newsletter from "@/components/home/Newsletter";
import { heroSlides } from "@/data/hero";
import { showcase } from "@/data/showcase";
import { listHomeSections } from "@/services/homeSectionService";
import { listProductsByCollection } from "@/services/productService";

export default async function HomePage() {
	const sections = JSON.parse(JSON.stringify(await listHomeSections()));

	const rows = await Promise.all(
		sections.map(async (s) => ({
			...s,
			products: JSON.parse(
				JSON.stringify(await listProductsByCollection(s.collection)),
			),
		})),
	);

	return (
		<>
			<HeroSlider slides={heroSlides} />

			{rows.map(
				(row) =>
					row.products.length > 0 && (
						<ProductRow
							key={row._id}
							title={row.title}
							products={row.products}
							viewAll={
								row.showViewAll
									? {
											href: `/collections/${row.collection}`,
											label: "View All",
											variant: row.viewAllStyle,
										}
									: undefined
							}
						/>
					),
			)}

			<ShowcaseGrid {...showcase} />

			<ShopByEvent />

			<InstagramGrid />

			<Newsletter />
		</>
	);
}
