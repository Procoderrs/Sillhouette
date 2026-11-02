"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore, toApiItem, lineKeyOf } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

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

	const [form, setForm] = useState(EMPTY);
	const [quote, setQuote] = useState(null);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [errors, setErrors] = useState({});

	// Cart ka summary server se (prices database se)
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

	function update(e) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setErrors({});
		setSubmitting(true);

		try {
			const res = await fetch("/api/checkout", {
				method: "POST",
				headers: JSON_HEADERS,
				body: JSON.stringify({ ...form, items: items.map(toApiItem) }),
			});

			const data = await res.json().catch(() => null);

			if (!res.ok || !data) {
				console.error("Checkout failed:", res.status, data);
				setErrors(data?.errors || {});
				setError(
					data?.message ||
						`Server error (${res.status}). Terminal logs check karein.`,
				);
				setSubmitting(false);
				return;
			}

			window.location.href = data.data.url;
		} catch (err) {
			console.error("Checkout network error:", err);
			setError(
				"Could not reach the server. Check your connection and try again.",
			);
			setSubmitting(false);
		}
	}

	if (items.length === 0) {
		return (
			<div className="space-y-4">
				<p className="text-[14px]">Aap ki cart khali hai.</p>
				<Link href="/" className="btn-primary inline-block">
					Shop now
				</Link>
			</div>
		);
	}

	const usd = quote && pkrPerUsd ? (quote.total / pkrPerUsd).toFixed(2) : null;

	return (
		<div className="grid gap-10 md:grid-cols-[1fr_360px]">
			<form onSubmit={handleSubmit} className="space-y-5">
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

				{error && <p className="text-[14px] text-sale">{error}</p>}

				<button
					type="submit"
					disabled={submitting}
					className="btn-primary w-full disabled:opacity-50"
				>
					{submitting ? "Redirecting to payment..." : "Pay with card"}
				</button>
			</form>

			<aside className="h-fit space-y-4 border border-line bg-white p-6 text-[14px]">
				<p className="text-[12px] uppercase tracking-[0.2em]">Order summary</p>

				{quote?.items.map((l) => (
					<div key={lineKeyOf(l)} className="flex justify-between gap-4">
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
								Card par approx ${usd} USD charge hoga (1 USD = Rs.{pkrPerUsd})
							</p>
						)}
					</div>
				)}
			</aside>
		</div>
	);
}
