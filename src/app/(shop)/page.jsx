import HeroSlider from "@/components/home/HeroSlider";
import ProductRow from "@/components/home/ProductRow";
import ShowcaseGrid from "@/components/home/ShowcaseGrid";
import ShopByEvent from "@/components/home/ShopByEvent";
import InstagramGrid from "@/components/home/InstagramGrid";
import Newsletter from "@/components/home/Newsletter";
import { heroSlides } from "@/data/hero";
import { products } from "@/data/products";
import { showcase } from "@/data/showcase";

const byCollection = (c) => products.filter((p) => p.collection === c);

export default function HomePage() {
	return (
		<>
			<HeroSlider slides={heroSlides} />

			<ProductRow
				title="Maahi II Luxury Eid Pret"
				products={byCollection("maahi-ii-luxury-eid-pret")}
			/>

			<ProductRow
				title="Silk Solids 26"
				products={byCollection("silk-solids-26")}
			/>

			<ProductRow
				title="Raha Eid Pret"
				products={byCollection("raha-eid-pret")}
				viewAll={{
					href: "/collections/raha-eid-pret",
					label: "View All",
					variant: "sale",
				}}
			/>

			<ProductRow
				title="Best Sellers"
				products={byCollection("best-sellers")}
				viewAll={{ href: "/collections/best-sellers", label: "View All" }}
			/>

			<ProductRow
				title="Formals"
				products={byCollection("formal")}
				viewAll={{ href: "/collections/formal", label: "View All" }}
			/>

			<ShowcaseGrid {...showcase} />

			<ShopByEvent />

			<InstagramGrid />

			<Newsletter />
		</>
	);
}
