import Link from "next/link";
import { listOrders } from "@/services/orderService";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_LABELS, ORDER_BADGE } from "@/lib/orderStatus";

const FILTERS = ["all", ...ORDER_STATUSES];

export default async function AdminOrdersPage({ searchParams }) {
	const { status = "all" } = await searchParams;
	const orders = JSON.parse(JSON.stringify(await listOrders({ status })));

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-[22px] uppercase tracking-[0.12em]">Orders</h1>
				<span className="text-[13px] text-neutral-500">
					{orders.length} orders
				</span>
			</div>

			<div className="flex flex-wrap gap-2">
				{FILTERS.map((s) => (
					<Link
						key={s}
						href={`/admin/orders?status=${s}`}
						className={`border px-3 py-1.5 text-[12px] uppercase tracking-[0.1em] ${
							status === s
								? "border-black bg-black text-white"
								: "border-neutral-300 bg-white hover:border-black"
						}`}
					>
						{s === "all" ? "All" : ORDER_LABELS[s]}
					</Link>
				))}
			</div>

			<div className="overflow-x-auto border border-neutral-200 bg-white">
				<table className="w-full min-w-[860px] text-left text-[14px]">
					<thead className="bg-neutral-50 text-[12px] uppercase tracking-[0.1em] text-neutral-600">
						<tr>
							<th className="px-4 py-3 font-medium">Order</th>
							<th className="px-4 py-3 font-medium">Date</th>
							<th className="px-4 py-3 font-medium">Customer</th>
							<th className="px-4 py-3 font-medium">Items</th>
							<th className="px-4 py-3 text-right font-medium">Total</th>
							<th className="px-4 py-3 font-medium">Status</th>
							<th className="px-4 py-3" />
						</tr>
					</thead>
					<tbody className="divide-y divide-neutral-200">
						{orders.map((o) => (
							<tr key={o._id} className="hover:bg-neutral-50">
								<td className="px-4 py-3 font-medium">{o.orderNumber}</td>
								<td className="px-4 py-3 text-neutral-600">
									{new Date(o.createdAt).toLocaleDateString("en-PK")}
								</td>
								<td className="px-4 py-3">
									<p>{o.shipping?.name}</p>
									<p className="text-[12px] text-neutral-500">{o.email}</p>
								</td>
								<td className="px-4 py-3">
									{o.items.reduce((sum, i) => sum + i.qty, 0)}
								</td>
								<td className="px-4 py-3 text-right">{formatPrice(o.total)}</td>
								<td className="px-4 py-3">
									<span
										className={`inline-block border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] ${ORDER_BADGE[o.status] ?? ""}`}
									>
										{ORDER_LABELS[o.status] ?? o.status}
									</span>
								</td>
								<td className="px-4 py-3 text-right">
									<Link
										href={`/admin/orders/${o._id}`}
										className="text-[13px] underline underline-offset-4"
									>
										View
									</Link>
								</td>
							</tr>
						))}
						{orders.length === 0 && (
							<tr>
								<td
									colSpan={7}
									className="px-4 py-12 text-center text-neutral-500"
								>
									No orders found.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}
