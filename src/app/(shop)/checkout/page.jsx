import CheckoutForm from "@/components/checkout/CheckoutForm";
import { getSettings } from "@/services/settingService";

export const metadata = {
	title: "Checkout | Silhouette",
};

export default async function CheckoutPage({ searchParams }) {
	const { cancelled } = await searchParams;
	const settings = JSON.parse(JSON.stringify(await getSettings()));

	return (
		<section className="site-container max-w-5xl py-10">
			<h1 className="mb-8 text-[22px] uppercase tracking-[0.15em]">Checkout</h1>

			{cancelled && (
				<p className="mb-6 text-[14px] text-sale">Payment Cancel . Try again</p>
			)}

			<CheckoutForm pkrPerUsd={settings.pkrPerUsd} />
		</section>
	);
}
