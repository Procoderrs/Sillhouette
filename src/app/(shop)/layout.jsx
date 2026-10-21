import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

export default function ShopLayout({ children }) {
	return (
		<>
			<AnnouncementBar />
			<Header />
			<main>{children}</main>
			<Footer />
			<CartDrawer />
		</>
	);
}
