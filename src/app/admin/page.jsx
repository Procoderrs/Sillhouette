import Link from "next/link";
import { getDashboardData } from "@/services/dashboardService";
import { formatPrice } from "@/lib/utils";
import { ORDER_LABELS, ORDER_BADGE } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

function Card({ label, value, sub }) {
	return (
		<div className="space-y-2 border border-neutral-200 bg-white p-5">
			<p className="text-[11px] uppercase tracking-[0.15em] text-neutral-500">
				{label}
			</p>
			<p className="text-[24px] font-semibold">{value}</p>
			{sub && <p className="text-[12px] text-neutral-500">{sub}</p>}
		</div>
	);
}

export default async function AdminDashboardPage() {
	const d = JSON.parse(JSON.stringify(await getDashboardData()));
	const maxDay = Math.max(1, ...d.days.map((x) => x.total));

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-[24px] uppercase tracking-[0.15em]">Dashboard</h1>
				<p className="text-[13px] text-neutral-500">Overview of your store</p>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				<Card
					label="Revenue (all time)"
					value={formatPrice(d.revenue)}
					sub={`${d.soldOrders} paid orders`}
				/>
				<Card
					label="Orders today"
					value={d.todayOrders}
					sub="Since midnight (PKT)"
				/>
				<Card
					label="Pending payment"
					value={d.statusCounts.pending_payment ?? 0}
					sub="Waiting for card payment"
				/>
				<Card
					label="Products"
					value={d.products.active}
					sub={`${d.products.inactive} inactive`}
				/>
				<Card
					label="Low stock variants"
					value={d.lowStock.length}
					sub={`Stock ${5} or less`}
				/>
				<Card
					label="Reviews"
					value={d.reviews.count}
					sub={
						d.reviews.count
							? `${d.reviews.avg.toFixed(1)} average rating`
							: "No reviews yet"
					}
				/>
			</div>

			<section className="border border-neutral-200 bg-white p-6">
				<p className="mb-6 text-[12px] uppercase tracking-[0.2em] text-neutral-500">
					Revenue, last 7 days
				</p>
				<div className="flex h-40 items-end gap-3">
					{d.days.map((day) => {
						const pct = (day.total / maxDay) * 100;
						return (
							<div
								key={day.date}
								className="flex h-full flex-1 flex-col justify-end"
							>
								<div
									title={`${formatPrice(day.total)} (${day.count} orders)`}
									className="w-full bg-black"
									style={{ height: `${Math.max(pct, 2)}%` }}
								/>
							</div>
						);
					})}
				</div>
				<div className="mt-2 flex gap-3">
					{d.days.map((day) => (
						<p
							key={day.date}
							className="flex-1 text-center text-[11px] text-neutral-500"
						>
							{new Date(day.date).toLocaleDateString("en-PK", {
								weekday: "short",
							})}
						</p>
					))}
				</div>
			</section>

			<div className="grid gap-8 xl:grid-cols-2">
				<section className="border border-neutral-200 bg-white">
					<div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
						<p className="text-[12px] uppercase tracking-[0.2em]">
							Recent orders
						</p>
						<Link href="/admin/orders" className="text-[12px] underline">
							View all
						</Link>
					</div>
					<ul className="divide-y divide-neutral-200">
						{d.recentOrders.length === 0 && (
							<li className="px-5 py-4 text-[14px] text-neutral-500">
								No orders yet.
							</li>
						)}
						{d.recentOrders.map((o) => (
							<li
								key={o._id}
								className="flex items-center justify-between gap-4 px-5 py-3 text-[14px]"
							>
								<div>
									<Link
										href={`/admin/orders/${o._id}`}
										className="font-mono text-[13px] underline"
									>
										{o.orderNumber}
									</Link>
									<p className="text-[12px] text-neutral-500">
										{o.shipping?.name}
									</p>
								</div>
								<div className="text-right">
									<p>{formatPrice(o.total)}</p>
									<span
										className={`inline-block border px-2 py-0.5 text-[11px] uppercase ${ORDER_BADGE[o.status] ?? ""}`}
									>
										{ORDER_LABELS[o.status] ?? o.status}
									</span>
								</div>
							</li>
						))}
					</ul>
				</section>

				<section className="border border-neutral-200 bg-white">
					<div className="border-b border-neutral-200 px-5 py-4">
						<p className="text-[12px] uppercase tracking-[0.2em]">Low stock</p>
					</div>
					<ul className="divide-y divide-neutral-200">
						{d.lowStock.length === 0 && (
							<li className="px-5 py-4 text-[14px] text-neutral-500">
								All variants are well stocked.
							</li>
						)}
						{d.lowStock.map((v) => (
							<li
								key={`${v._id ?? v.sku}`}
								className="flex items-center justify-between px-5 py-3 text-[14px]"
							>
								<div>
									<p>{v.name}</p>
									<p className="font-mono text-[12px] text-neutral-500">
										{v.sku}
									</p>
								</div>
								<span
									className={`font-semibold ${v.stock === 0 ? "text-red-700" : "text-amber-700"}`}
								>
									{v.stock === 0 ? "Out of stock" : `${v.stock} left`}
								</span>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
