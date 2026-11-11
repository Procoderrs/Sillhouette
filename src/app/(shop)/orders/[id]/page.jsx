import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById, syncPaymentStatus } from "@/services/orderService";
import OrderStatus from "@/components/checkout/OrderStatus";
import { formatPrice } from "@/lib/utils";
import { getCurrentUser } from "@/lib/session";
import { searchParamsToUrlQuery } from "next/dist/shared/lib/router/utils/querystring";
import CancelOrderButton from "@/components/checkout/CancelOrderButton";
const LABELS = {
	pending_payment: "Payment pending",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	payment_failed: "Payment failed",
};

const BADGE = {
	pending_payment: "border-amber-300 bg-amber-50 text-amber-800",
	paid: "border-emerald-300 bg-emerald-50 text-emerald-800",
	processing: "border-sky-300 bg-sky-50 text-sky-800",
	shipped: "border-sky-300 bg-sky-50 text-sky-800",
	delivered: "border-emerald-300 bg-emerald-50 text-emerald-800",
	cancelled: "border-neutral-300 bg-neutral-100 text-neutral-700",
	payment_failed: "border-red-300 bg-red-50 text-red-800",
};

export default async function OrderPage({ params, searchParams }) {
	const { id } = await params;
	const { t } = await searchParams;

	const existing = await getOrderById(id);

	if (!existing) notFound();

	const user = await getCurrentUser();
	const isOwner = Boolean(
		user && existing.user && String(user._id) === String(existing.user),
	);
	const hasLink = Boolean(
		t && existing.accessToken && t === existing.accessToken,
	);
	if (!isOwner && !hasLink) notFound();

	// Stripe se payment status check karein
	await syncPaymentStatus(id);

	const raw = await getOrderById(id);
	const order = JSON.parse(JSON.stringify(raw));
	const history = [...(order.statusHistory ?? [])].reverse();

	return (
		<section className="site-container max-w-6xl py-10 md:py-14">
			<OrderStatus status={order.status} />

			<div className="mb-10 space-y-3">
				<p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">
					Order
				</p>
				<h1 className="text-[26px] uppercase tracking-[0.12em] md:text-[32px]">
					{order.orderNumber}
				</h1>
				<span
					className={`inline-block border px-3 py-1 text-[12px] uppercase tracking-[0.15em] ${BADGE[order.status] ?? ""}`}
				>
					{LABELS[order.status] ?? order.status}
				</span>

				{order.status === "paid" && (
					<p className="pt-2 text-[15px]">
						Thank you! Your payment has been received. We will process your
						order shortly.
					</p>
				)}
				{order.status === "pending_payment" && (
					<div className="space-y-4 border border-neutral-200 p-6">
						<p className="text-[14px]">
							Your payment is not complete yet. Pay within 1 hour, otherwise
							this order will be cancelled.
						</p>
						<RepayForm orderId={String(order._id)} token={t} />
					</div>
				)}
				{order.status === "payment_failed" && (
					<p className="pt-2 text-[14px] text-red-700">
						Your payment failed. Please try again.
					</p>
				)}

				{/* ...items list aur summary ke baad... */}

				{["pending_payment", "paid"].includes(order.status) && (
					<div className="pt-8">
						<CancelOrderButton orderId={String(order._id)} token={t} />
					</div>
				)}

				{/* Continue shopping button */}
			</div>

			<div className="grid gap-12 md:grid-cols-[1fr_360px]">
				<div className="space-y-12">
					<div className="space-y-4">
						<p className="text-[12px] uppercase tracking-[0.2em]">Items</p>
						<ul className="divide-y divide-line">
							{order.items.map((item, i) => (
								<li key={i} className="flex gap-6 py-6">
									<div className="relative h-48 w-36 shrink-0 overflow-hidden bg-neutral-100 md:h-64 md:w-44">
										{item.image && (
											<Image
												src={item.image}
												alt={item.name}
												fill
												sizes="176px"
												className="object-cover"
											/>
										)}
									</div>
									<div className="flex flex-1 flex-col justify-between py-1 text-[15px]">
										<div className="space-y-1">
											<p className="text-[17px]">{item.name}</p>
											{item.variant && (
												<p className="text-[13px] text-neutral-500">
													{item.variant}
												</p>
											)}
											<p className="text-[13px] text-neutral-500">
												Qty {item.qty}
											</p>
										</div>
										<p className="text-[16px]">
											{formatPrice(item.price * item.qty)}
										</p>
									</div>
								</li>
							))}
						</ul>
					</div>

					{history.length > 0 && (
						<div className="space-y-4">
							<p className="text-[12px] uppercase tracking-[0.2em]">
								Order history
							</p>
							<ol className="space-y-3 border-l border-line pl-5 text-[14px]">
								{history.map((h, i) => (
									<li key={i}>
										<p className="font-medium">
											{LABELS[h.status] ?? h.status}
										</p>
										{h.note && <p className="text-neutral-500">{h.note}</p>}
										{h.at && (
											<p className="text-[12px] text-neutral-400">
												{new Date(h.at).toLocaleString("en-PK")}
											</p>
										)}
									</li>
								))}
							</ol>
						</div>
					)}
				</div>

				<aside className="h-fit space-y-8 border border-line bg-white p-6 text-[14px]">
					<div className="space-y-2">
						<p className="text-[12px] uppercase tracking-[0.2em]">Summary</p>
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>{formatPrice(order.subtotal)}</span>
						</div>
						<div className="flex justify-between">
							<span>Express</span>
							<span>{formatPrice(order.expressTotal)}</span>
						</div>
						<div className="flex justify-between border-t border-line pt-3 text-[16px] font-semibold">
							<span>Total</span>
							<span>{formatPrice(order.total)}</span>
						</div>
					</div>

					<div className="space-y-1 border-t border-line pt-6">
						<p className="mb-2 text-[12px] uppercase tracking-[0.2em]">
							Shipping to
						</p>
						<p>{order.shipping.name}</p>
						<p>
							{order.shipping.address}, {order.shipping.city}
						</p>
						{order.shipping.postalCode && <p>{order.shipping.postalCode}</p>}
						<p>{order.shipping.country}</p>
						<p className="pt-2 text-neutral-500">{order.phone}</p>
					</div>

					<Link href="/" className="btn-primary block w-full text-center">
						Continue shopping
					</Link>
				</aside>
			</div>
		</section>
	);
}
