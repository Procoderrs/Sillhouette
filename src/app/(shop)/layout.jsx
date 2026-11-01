import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import CartSync from "@/components/cart/CartSync";
import { getCurrentUser } from "@/lib/session";
import { getNavigation } from "@/services/collectionService";
import { getSettings } from "@/services/settingService";

export default async function ShopLayout({ children }) {
	const user = await getCurrentUser();

	// ObjectId aur Date client component mein direct nahi jate, isliye plain object banate hain
	const plainUser = user ? JSON.parse(JSON.stringify(user)) : null;
	const headerUser = plainUser ? { firstName: plainUser.firstName } : null;

	const navigation = JSON.parse(JSON.stringify(await getNavigation()));
	const settings = JSON.parse(JSON.stringify(await getSettings()));

	return (
		<>
			<AnnouncementBar />
			<Header user={headerUser} navigation={navigation} />
			<main>{children}</main>
			<Footer settings={settings} />
			<CartDrawer />
			<CartSync user={plainUser} />
		</>
	);
}
