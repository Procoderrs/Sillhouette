import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrderById } from "@/services/orderService";
import OrderStatus from "@/components/checkout/OrderStatus";
import { formatPrice } from "@/lib/utils";

const LABELS = {
	pending_payment: "Payment pending",
	paid: "Paid",
	processing: "Processing",
	shipped: "Shipped",
	delivered: "Delivered",
	cancelled: "Cancelled",
	payment_failed: "Payment failed",
};

export default async function OrderPage({ params }) {
	const { id } = await params;
	const raw = await getOrderById(id);
	if (!raw) notFound();

	const order = JSON.parse(JSON.stringify(raw));

	return (
		<section className="site-container max-w-3xl space-y-8 py-10">
			<OrderStatus status={order.status} />

			<div className="space-y-2">
				<p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
					Order
				</p>
				<h1 className="text-[22px] uppercase tracking-[0.1em]">
					{order.orderNumber}
				</h1>
				<p className="text-[15px]">
					Status: {LABELS[order.status] ?? order.status}
				</p>
				{order.status === "pending_payment" && (
					<p className="text-[13px] text-neutral-500">
						Payment confirm ho rahi hai. Thodi der mein status update ho jayega.
					</p>
				)}
			</div>

			<ul className="space-y-4 border-t border-line pt-6 text-[14px]">
				{order.items.map((item, i) => (
					<li key={i} className="flex justify-between gap-4">
						<span>
							{item.name}
							{item.variant && (
								<span className="block text-[12px] text-neutral-500">
									{item.variant}
								</span>
							)}
							<span className="text-[12px] text-neutral-500">
								Qty {item.qty}
							</span>
						</span>
						<span>{formatPrice(item.price * item.qty)}</span>
					</li>
				))}
			</ul>

			<div className="space-y-2 border-t border-line pt-6 text-[14px]">
				<div className="flex justify-between">
					<span>Subtotal</span>
					<span>{formatPrice(order.subtotal)}</span>
				</div>
				<div className="flex justify-between">
					<span>Express</span>
					<span>{formatPrice(order.expressTotal)}</span>
				</div>
				<div className="flex justify-between font-semibold">
					<span>Total</span>
					<span>{formatPrice(order.total)}</span>
				</div>
			</div>

			<div className="space-y-1 border-t border-line pt-6 text-[14px]">
				<p className="text-[12px] uppercase tracking-[0.2em]">Shipping to</p>
				<p>{order.shipping.name}</p>
				<p>
					{order.shipping.address}, {order.shipping.city}
				</p>
				<p>{order.shipping.country}</p>
			</div>

			<Link href="/" className="btn-primary inline-block">
				Continue shopping
			</Link>
		</section>
	);
}
