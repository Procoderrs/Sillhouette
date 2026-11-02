"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { useCartStore, toApiItem, lineKeyOf } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const JSON_HEADERS = { "Content-Type": "application/json" };

const field =
	"w-full border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black";
const label = "mb-1 block text-[12px] uppercase tracking-[0.12em]";

const EMPTY = {
	name: "",
	email: "",
	phone: "",
	country: "Pakistan",
	city: "",
	address: "",
	postalCode: "",
};

export default function CheckoutForm({ pkrPerUsd }) {
	const items = useCartStore((s) => s.items);
	const itemsKey = JSON.stringify(items);
	const [quote, setQuote] = useState(null);

	useEffect(() => {
		if (items.length === 0) {
			setQuote(null);
			return;
		}
		let cancelled = false;
		fetch("/api/cart/quote", {
			method: "POST",
			headers: JSON_HEADERS,
			body: JSON.stringify({ items: items.map(toApiItem) }),
		})
			.then(async (res) => {
				const data = await res.json();
				if (!cancelled && res.ok) setQuote(data.data);
			})
			.catch(() => {});
		return () => {
			cancelled = true;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [itemsKey]);

	if (items.length === 0) {
		return (
			<div className="space-y-4">
				<p className="text-[14px]">Your cart is empty.</p>
				<Link href="/" className="btn-primary inline-block">
					Shop now
				</Link>
			</div>
		);
	}

	const usdCents =
		quote && pkrPerUsd ? Math.round((quote.total / pkrPerUsd) * 100) : 0;

	return (
		<Elements
			stripe={stripePromise}
			options={{
				mode: "payment",
				amount: Math.max(usdCents, 50),
				currency: "usd",
				paymentMethodTypes: ["card"],
			}}
		>
			<CheckoutFields quote={quote} pkrPerUsd={pkrPerUsd} />
		</Elements>
	);
}

function CheckoutFields({ quote, pkrPerUsd }) {
	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();
	const items = useCartStore((s) => s.items);

	const [form, setForm] = useState(EMPTY);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [errors, setErrors] = useState({});

	function update(e) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		if (!stripe || !elements) return;

		setError("");
		setErrors({});
		setSubmitting(true);

		// Card details validate karein
		const { error: submitError } = await elements.submit();
		if (submitError) {
			setError(submitError.message);
			setSubmitting(false);
			return;
		}

		// Server par order aur PaymentIntent banayein
		let data;
		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: JSON_HEADERS,
				body: JSON.stringify({ ...form, items: items.map(toApiItem) }),
			});
			data = await res.json().catch(() => null);

			if (!res.ok || !data?.success) {
				setErrors(data?.errors || {});
				setError(data?.message || `Could not place order (${res.status})`);
				setSubmitting(false);
				return;
			}
		} catch {
			setError("Could not reach the server. Please try again.");
			setSubmitting(false);
			return;
		}

		const { orderId, clientSecret } = data.data;

		// Card se payment karein. Redirect nahi hoga, jab tak 3D Secure na ho.
		const { error: payError } = await stripe.confirmPayment({
			elements,
			clientSecret,
			confirmParams: {
				return_url: `${window.location.origin}/orders/${orderId}`,
			},
			redirect: "if_required",
		});

		if (payError) {
			setError(payError.message);
			setSubmitting(false);
			return;
		}

		router.push(`/orders/${orderId}`);
	}

	const usd = quote && pkrPerUsd ? (quote.total / pkrPerUsd).toFixed(2) : null;

	return (
		<div className="grid gap-10 md:grid-cols-[1fr_360px]">
			<form onSubmit={handleSubmit} className="space-y-6">
				<div className="grid gap-5 md:grid-cols-2">
					<div>
						<label className={label}>Full name</label>
						<input
							name="name"
							className={field}
							value={form.name}
							onChange={update}
						/>
						{errors.name && (
							<p className="mt-1 text-[12px] text-sale">{errors.name}</p>
						)}
					</div>
					<div>
						<label className={label}>Email</label>
						<input
							name="email"
							type="email"
							className={field}
							value={form.email}
							onChange={update}
						/>
						{errors.email && (
							<p className="mt-1 text-[12px] text-sale">{errors.email}</p>
						)}
					</div>
					<div>
						<label className={label}>Phone</label>
						<input
							name="phone"
							className={field}
							value={form.phone}
							onChange={update}
						/>
						{errors.phone && (
							<p className="mt-1 text-[12px] text-sale">{errors.phone}</p>
						)}
					</div>
					<div>
						<label className={label}>Country</label>
						<input
							name="country"
							className={field}
							value={form.country}
							onChange={update}
						/>
						{errors.country && (
							<p className="mt-1 text-[12px] text-sale">{errors.country}</p>
						)}
					</div>
					<div>
						<label className={label}>City</label>
						<input
							name="city"
							className={field}
							value={form.city}
							onChange={update}
						/>
						{errors.city && (
							<p className="mt-1 text-[12px] text-sale">{errors.city}</p>
						)}
					</div>
					<div>
						<label className={label}>Postal code</label>
						<input
							name="postalCode"
							className={field}
							value={form.postalCode}
							onChange={update}
						/>
					</div>
				</div>

				<div>
					<label className={label}>Address</label>
					<textarea
						name="address"
						rows={3}
						className={field}
						value={form.address}
						onChange={update}
					/>
					{errors.address && (
						<p className="mt-1 text-[12px] text-sale">{errors.address}</p>
					)}
				</div>

				<div className="space-y-3">
					<p className="text-[12px] uppercase tracking-[0.2em]">Payment</p>
					<p className="text-[12px] text-neutral-500">
						All transactions are secure and encrypted.
					</p>
					<div className="border border-neutral-300 bg-white p-4">
						<PaymentElement
							options={{
								wallets: { applePay: "never", googlePay: "never" },
								paymentMethodOrder: ["card"],
							}}
						/>
					</div>
				</div>

				{error && <p className="text-[14px] text-sale">{error}</p>}

				<button
					type="submit"
					disabled={submitting || !stripe}
					className="btn-primary w-full disabled:opacity-50"
				>
					{submitting ? "Processing..." : "Pay now"}
				</button>
			</form>

			<aside className="h-fit space-y-4 border border-line bg-white p-6 text-[14px]">
				<p className="text-[12px] uppercase tracking-[0.2em]">Order summary</p>

				{quote?.items.map((l, i) => (
					<div
						key={`${l.productId ?? "line"}-${i}`}
						className="flex justify-between gap-4"
					>
						<span>
							{l.name}
							{l.variant && (
								<span className="block text-[12px] text-neutral-500">
									{l.variant}
								</span>
							)}
							<span className="text-[12px] text-neutral-500">Qty {l.qty}</span>
						</span>
						<span>{formatPrice(l.price * l.qty)}</span>
					</div>
				))}

				{quote && (
					<div className="space-y-2 border-t border-line pt-4">
						<div className="flex justify-between">
							<span>Subtotal</span>
							<span>{formatPrice(quote.subtotal)}</span>
						</div>
						<div className="flex justify-between">
							<span>Express</span>
							<span>{formatPrice(quote.expressTotal)}</span>
						</div>
						<div className="flex justify-between font-semibold">
							<span>Total</span>
							<span>{formatPrice(quote.total)}</span>
						</div>
						{usd && (
							<p className="text-[12px] text-neutral-500">
								Approx. ${usd} USD will be charged to your card (1 USD = Rs.
								{pkrPerUsd})
							</p>
						)}
					</div>
				)}
			</aside>
		</div>
	);
}
