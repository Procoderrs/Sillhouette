import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { listOrdersForUser } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { ORDER_LABELS, ORDER_BADGE } from "@/lib/orderStatus";

export const metadata = {
	title: "My orders | Silhouette",
};

export default async function AccountOrdersPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/account/login");

	const orders = JSON.parse(JSON.stringify(await listOrdersForUser(user._id)));

	return (
		<section className="site-container max-w-4xl py-10 md:py-14">
			<div className="mb-10 border-b border-neutral-200 pb-6">
				<p className="text-[12px] uppercase tracking-[0.3em] text-neutral-500">
					Account
				</p>
				<h1 className="mt-2 text-[26px] uppercase tracking-[0.15em] md:text-[32px]">
					My orders
				</h1>
			</div>

			{orders.length === 0 ? (
				<div className="space-y-5 py-12 text-center">
					<p className="text-[15px] text-neutral-600">
						You have not placed any orders yet.
					</p>
					<Link href="/" className="btn-primary inline-block">
						Continue shopping
					</Link>
				</div>
			) : (
				<ul className="divide-y divide-neutral-200 border-y border-neutral-200">
					{orders.map((o) => (
						<li key={o._id}>
							<Link
								href={`/orders/${o._id}`}
								className="flex flex-col gap-3 py-6 transition hover:bg-neutral-50 sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="space-y-1">
									<p className="text-[15px] font-medium tracking-[0.05em]">
										{o.orderNumber}
									</p>
									<p className="text-[13px] text-neutral-500">
										{new Date(o.createdAt).toLocaleDateString("en-PK", {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}{" "}
										· {o.items.reduce((sum, i) => sum + i.qty, 0)} items
									</p>
								</div>
								<div className="flex items-center gap-6">
									<span
										className={`border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] ${ORDER_BADGE[o.status] ?? ""}`}
									>
										{ORDER_LABELS[o.status] ?? o.status}
									</span>
									<span className="min-w-[90px] text-right text-[15px]">
										{formatPrice(o.total)}
									</span>
								</div>
							</Link>
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
