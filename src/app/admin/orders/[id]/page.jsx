import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import OrderStatusForm from "@/components/admin/OrderStatusForm";
import { formatPrice } from "@/lib/utils";
import { ORDER_LABELS, ORDER_BADGE } from "@/lib/orderStatus";

export default async function AdminOrderDetail({ params }) {
	const { id } = await params;
	const raw = await getOrderById(id);
	if (!raw) notFound();

	const order = JSON.parse(JSON.stringify(raw));
	const history = [...(order.statusHistory ?? [])].reverse();

	return (
		<div className="grid gap-8 lg:grid-cols-[1fr_340px]">
			<div className="space-y-8">
				<div className="flex flex-wrap items-center gap-4">
					<Link
						href="/admin/orders"
						className="text-[13px] underline underline-offset-4"
					>
						← Back to orders
					</Link>
				</div>

				<div className="space-y-2">
					<h1 className="text-[22px] uppercase tracking-[0.12em]">
						{order.orderNumber}
					</h1>
					<span
						className={`inline-block border px-2 py-0.5 text-[11px] uppercase tracking-[0.1em] ${ORDER_BADGE[order.status] ?? ""}`}
					>
						{ORDER_LABELS[order.status] ?? order.status}
					</span>
				</div>

				<div className="overflow-x-auto border border-neutral-200 bg-white">
					<table className="w-full min-w-[600px] text-left text-[14px]">
						<thead className="bg-neutral-50 text-[12px] uppercase tracking-[0.1em] text-neutral-600">
							<tr>
								<th className="px-4 py-3 font-medium">Product</th>
								<th className="px-4 py-3 font-medium">Variant</th>
								<th className="px-4 py-3 text-center font-medium">Qty</th>
								<th className="px-4 py-3 text-right font-medium">Price</th>
								<th className="px-4 py-3 text-right font-medium">Line total</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200">
							{order.items.map((item, i) => (
								<tr key={i}>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											{item.image && (
												<div className="relative h-14 w-10 shrink-0 overflow-hidden bg-neutral-100">
													<Image
														src={item.image}
														alt={item.name}
														fill
														sizes="40px"
														className="object-cover"
													/>
												</div>
											)}
											<span>{item.name}</span>
										</div>
									</td>
									<td className="px-4 py-3 text-neutral-600">
										{item.variant || "—"}
									</td>
									<td className="px-4 py-3 text-center">{item.qty}</td>
									<td className="px-4 py-3 text-right">
										{formatPrice(item.price)}
									</td>
									<td className="px-4 py-3 text-right">
										{formatPrice(item.price * item.qty)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				<div className="grid gap-6 md:grid-cols-2">
					<div className="space-y-1 border border-neutral-200 bg-white p-5 text-[14px]">
						<p className="mb-2 text-[12px] uppercase tracking-[0.15em] text-neutral-500">
							Customer
						</p>
						<p>{order.shipping?.name}</p>
						<p className="text-neutral-600">{order.email}</p>
						<p className="text-neutral-600">{order.phone}</p>
					</div>
					<div className="space-y-1 border border-neutral-200 bg-white p-5 text-[14px]">
						<p className="mb-2 text-[12px] uppercase tracking-[0.15em] text-neutral-500">
							Shipping address
						</p>
						<p>{order.shipping?.address}</p>
						<p>
							{order.shipping?.city} {order.shipping?.postalCode}
						</p>
						<p>{order.shipping?.country}</p>
					</div>
				</div>

				<div className="border border-neutral-200 bg-white p-5">
					<p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-neutral-500">
						Status history
					</p>
					<table className="w-full text-left text-[14px]">
						<thead className="text-[12px] uppercase tracking-[0.1em] text-neutral-500">
							<tr>
								<th className="py-2 font-medium">Status</th>
								<th className="py-2 font-medium">Note</th>
								<th className="py-2 font-medium">Date</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-neutral-200">
							{history.map((h, i) => (
								<tr key={i}>
									<td className="py-3">{ORDER_LABELS[h.status] ?? h.status}</td>
									<td className="py-3 text-neutral-600">{h.note || "—"}</td>
									<td className="py-3 text-neutral-500">
										{h.at ? new Date(h.at).toLocaleString("en-PK") : "—"}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			<aside className="h-fit space-y-6 border border-neutral-200 bg-white p-6">
				<div className="space-y-2 text-[14px]">
					<p className="mb-2 text-[12px] uppercase tracking-[0.15em] text-neutral-500">
						Totals
					</p>
					<div className="flex justify-between">
						<span>Subtotal</span>
						<span>{formatPrice(order.subtotal)}</span>
					</div>
					<div className="flex justify-between">
						<span>Express</span>
						<span>{formatPrice(order.expressTotal)}</span>
					</div>
					<div className="flex justify-between border-t pt-2 font-semibold">
						<span>Total</span>
						<span>{formatPrice(order.total)}</span>
					</div>
					<p className="pt-2 text-[12px] text-neutral-500">
						Charged: ${(order.chargedUsdCents / 100).toFixed(2)} USD (1 USD =
						Rs.{order.pkrPerUsd})
					</p>
				</div>

				<div className="border-t pt-6">
					<p className="mb-4 text-[12px] uppercase tracking-[0.15em] text-neutral-500">
						Update status
					</p>
					<OrderStatusForm orderId={order._id} currentStatus={order.status} />
				</div>
			</aside>
		</div>
	);
}
