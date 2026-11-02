"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { useCartStore, toApiItem } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const PAYMENT_OPTIONS = {
	wallets: { applePay: "never", googlePay: "never" },
};

const JSON_HEADERS = { "Content-Type": "application/json" };

const field =
	"w-full border border-neutral-300 bg-white px-3 py-2.5 text-[14px] outline-none transition focus:border-black";
const label =
	"mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-600";
const sectionTitle = "text-[12px] uppercase tracking-[0.25em] text-neutral-500";
const errorText = "mt-1 text-[12px] text-red-700";

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

	const usdCents =
		quote && pkrPerUsd ? Math.round((quote.total / pkrPerUsd) * 100) : 0;

	const elementsOptions = useMemo(
		() => ({
			mode: "payment",
			amount: Math.max(usdCents, 50),
			currency: "usd",
		}),
		[usdCents],
	);

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
			<div className="mx-auto max-w-md space-y-5 py-16 text-center">
				<p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">
					Checkout
				</p>
				<p className="text-[18px]">Your cart is empty.</p>
				<Link href="/" className="btn-primary inline-block">
					Continue shopping
				</Link>
			</div>
		);
	}

	return (
		<Elements stripe={stripePromise} options={elementsOptions}>
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

		// Card details ko validate karein
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
				setError(data?.message || `Could not place your order (${res.status})`);
				setSubmitting(false);
				return;
			}
		} catch {
			setError("Could not reach the server. Please try again.");
			setSubmitting(false);
			return;
		}

		const { orderId, clientSecret } = data.data;

		// Card se payment. Redirect sirf 3D Secure ke liye hota hai.
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
		<div className="site-container max-w-6xl py-10 md:py-14">
			<div className="mb-10 flex flex-col gap-2 border-b border-neutral-200 pb-6">
				<p className="text-[12px] uppercase tracking-[0.3em] text-neutral-500">
					Secure checkout
				</p>
				<h1 className="text-[26px] uppercase tracking-[0.15em] md:text-[32px]">
					Checkout
				</h1>
			</div>

			<div className="grid gap-12 md:grid-cols-[1fr_380px]">
				<form onSubmit={handleSubmit} className="space-y-12">
					<section className="space-y-6">
						<p className={sectionTitle}>01 — Shipping details</p>

						<div className="grid gap-5 md:grid-cols-2">
							<div>
								<label className={label}>Full name</label>
								<input
									name="name"
									className={field}
									value={form.name}
									onChange={update}
								/>
								{errors.name && <p className={errorText}>{errors.name}</p>}
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
								{errors.email && <p className={errorText}>{errors.email}</p>}
							</div>
							<div>
								<label className={label}>Phone</label>
								<input
									name="phone"
									className={field}
									value={form.phone}
									onChange={update}
								/>
								{errors.phone && <p className={errorText}>{errors.phone}</p>}
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
									<p className={errorText}>{errors.country}</p>
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
								{errors.city && <p className={errorText}>{errors.city}</p>}
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
							{errors.address && <p className={errorText}>{errors.address}</p>}
						</div>
					</section>

					<section className="space-y-6">
						<p className={sectionTitle}>02 — Payment</p>
						<p className="text-[12px] text-neutral-500">
							All transactions are secure and encrypted.
						</p>
						<div className="border border-neutral-300 bg-white p-5">
							<PaymentElement options={PAYMENT_OPTIONS} />
						</div>
					</section>

					{error && (
						<p className="border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
							{error}
						</p>
					)}

					<button
						type="submit"
						disabled={submitting || !stripe}
						className="btn-primary w-full py-4 disabled:opacity-50"
					>
						{submitting ? "Processing..." : "Pay now"}
					</button>
				</form>

				<aside className="h-fit space-y-6 border border-neutral-200 bg-[#faf8f5] p-6 md:sticky md:top-24">
					<div className="flex items-center justify-between">
						<p className="text-[12px] uppercase tracking-[0.25em]">
							Order summary
						</p>
						<span className="text-[12px] text-neutral-500">
							{quote?.items.length ?? 0} items
						</span>
					</div>

					<ul className="space-y-5">
						{quote?.items.map((l, i) => (
							<li key={`${l.productId ?? "line"}-${i}`} className="flex gap-4">
								<div className="relative h-24 w-[72px] shrink-0 overflow-hidden bg-neutral-100">
									{l.image && (
										<Image
											src={l.image}
											alt={l.name}
											fill
											sizes="72px"
											className="object-cover"
										/>
									)}
									<span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-[11px] text-white">
										{l.qty}
									</span>
								</div>
								<div className="flex flex-1 items-start justify-between gap-3 text-[14px]">
									<div className="space-y-1">
										<p>{l.name}</p>
										{l.variant && (
											<p className="text-[12px] text-neutral-500">
												{l.variant}
											</p>
										)}
									</div>
									<p>{formatPrice(l.price * l.qty)}</p>
								</div>
							</li>
						))}
					</ul>

					{quote && (
						<div className="space-y-3 border-t border-neutral-200 pt-5 text-[14px]">
							<div className="flex justify-between">
								<span>Subtotal</span>
								<span>{formatPrice(quote.subtotal)}</span>
							</div>
							<div className="flex justify-between">
								<span>Express</span>
								<span>{formatPrice(quote.expressTotal)}</span>
							</div>
							<div className="flex justify-between border-t border-neutral-200 pt-3 text-[17px] font-semibold">
								<span>Total</span>
								<span>{formatPrice(quote.total)}</span>
							</div>
							{usd && (
								<p className="pt-1 text-[12px] text-neutral-500">
									Approx. ${usd} USD will be charged to your card (1 USD = Rs.
									{pkrPerUsd})
								</p>
							)}
						</div>
					)}
				</aside>
			</div>
		</div>
	);
}
