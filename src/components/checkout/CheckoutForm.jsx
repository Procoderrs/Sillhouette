"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

const initial = {
	firstName: "",
	lastName: "",
	email: "",
	phone: "",
	address: "",
	city: "",
	country: "Pakistan",
	postalCode: "",
};

const required = [
	"firstName",
	"lastName",
	"email",
	"phone",
	"address",
	"city",
	"country",
];

const fieldClass =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

const payments = [
	{ value: "cod", label: "Cash on Delivery", disabled: false },
	{ value: "bank", label: "Bank Transfer", disabled: false },
	{ value: "card", label: "Card (coming soon)", disabled: true },
];

function Input({ name, label, value, onChange, type = "text", optional }) {
	return (
		<div>
			<label
				htmlFor={name}
				className="mb-2 block text-[12px] uppercase tracking-[0.2em]"
			>
				{label}
				{optional && (
					<span className="normal-case text-black/50"> (optional)</span>
				)}
			</label>
			<input
				id={name}
				name={name}
				type={type}
				value={value}
				onChange={onChange}
				className={fieldClass}
			/>
		</div>
	);
}

export default function CheckoutForm() {
	const items = useCartStore((s) => s.items);
	const clear = useCartStore((s) => s.clear);

	const [mounted, setMounted] = useState(false);
	const [form, setForm] = useState(initial);
	const [payment, setPayment] = useState("cod");
	const [error, setError] = useState("");
	const [placed, setPlaced] = useState(null);

	useEffect(() => setMounted(true), []);

	// localStorage server par nahi hota, is liye mount ke baad hi cart dikhayein
	const list = mounted ? items : [];
	const subtotal = list.reduce(
		(n, i) => n + (i.salePrice ?? i.price) * i.qty,
		0,
	);

	function handleChange(e) {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	}

	function handleSubmit(e) {
		e.preventDefault();

		if (!list.length) {
			setError("Your cart is empty.");
			return;
		}

		if (required.some((k) => !form[k].trim())) {
			setError("Please fill in all required fields.");
			return;
		}

		setError("");

		// Friday: yahan order backend par save hoga
		const orderNumber = `SIL-${Date.now().toString().slice(-6)}`;
		setPlaced({ orderNumber, total: subtotal });
		clear();
	}

	if (placed) {
		return (
			<section className="site-container py-24 text-center">
				<h1 className="text-[24px] tracking-[0.2em]">THANK YOU</h1>
				<p className="mt-4 text-[15px]">
					Your order number is <strong>{placed.orderNumber}</strong>.
				</p>
				<p className="mt-2 text-[14px] text-black/60">
					Total: {formatPrice(placed.total)}
				</p>
				<Link href="/" className="btn-primary mt-8 inline-block">
					Continue shopping
				</Link>
			</section>
		);
	}

	return (
		<section className="site-container py-12">
			<h1 className="mb-10 text-center text-[24px] tracking-[0.2em]">
				CHECKOUT
			</h1>

			{!mounted ? (
				<div className="min-h-[50vh]" />
			) : list.length === 0 ? (
				<div className="text-center">
					<p className="mb-6 text-[15px]">Your cart is currently empty.</p>
					<Link href="/" className="btn-primary inline-block">
						Continue shopping
					</Link>
				</div>
			) : (
				<form
					noValidate
					onSubmit={handleSubmit}
					className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[1fr_340px]"
				>
					<div className="space-y-10">
						<div>
							<h2 className="mb-5 text-[14px] uppercase tracking-[0.2em]">
								Contact
							</h2>
							<div className="grid gap-5 sm:grid-cols-2">
								<Input
									name="firstName"
									label="First name"
									value={form.firstName}
									onChange={handleChange}
								/>
								<Input
									name="lastName"
									label="Last name"
									value={form.lastName}
									onChange={handleChange}
								/>
								<Input
									name="email"
									label="Email"
									type="email"
									value={form.email}
									onChange={handleChange}
								/>
								<Input
									name="phone"
									label="Phone"
									type="tel"
									value={form.phone}
									onChange={handleChange}
								/>
							</div>
						</div>

						<div>
							<h2 className="mb-5 text-[14px] uppercase tracking-[0.2em]">
								Shipping address
							</h2>
							<div className="grid gap-5 sm:grid-cols-2">
								<div className="sm:col-span-2">
									<Input
										name="address"
										label="Address"
										value={form.address}
										onChange={handleChange}
									/>
								</div>
								<Input
									name="city"
									label="City"
									value={form.city}
									onChange={handleChange}
								/>
								<Input
									name="country"
									label="Country"
									value={form.country}
									onChange={handleChange}
								/>
								<Input
									name="postalCode"
									label="Postal code"
									value={form.postalCode}
									onChange={handleChange}
									optional
								/>
							</div>
						</div>

						<div>
							<h2 className="mb-5 text-[14px] uppercase tracking-[0.2em]">
								Payment method
							</h2>
							<div className="space-y-3">
								{payments.map((p) => (
									<label
										key={p.value}
										className={`flex items-center gap-3 border border-line p-4 text-[15px] ${
											p.disabled ? "opacity-40" : "cursor-pointer"
										}`}
									>
										<input
											type="radio"
											name="payment"
											value={p.value}
											checked={payment === p.value}
											disabled={p.disabled}
											onChange={() => setPayment(p.value)}
											className="accent-black"
										/>
										{p.label}
									</label>
								))}
							</div>
						</div>

						{error && <p className="text-[14px] text-sale">{error}</p>}
					</div>

					<aside className="h-fit border border-line p-6">
						<h2 className="mb-5 text-[14px] uppercase tracking-[0.2em]">
							Order summary
						</h2>

						<ul className="divide-y divide-line">
							{list.map((item) => (
								<li key={`${item.id}-${item.size}`} className="flex gap-4 py-4">
									<div className="relative h-20 w-16 shrink-0 bg-soft">
										<Image
											src={item.image}
											alt={item.name}
											fill
											sizes="64px"
											className="object-cover"
										/>
									</div>
									<div className="flex flex-1 flex-col text-[14px]">
										<p className="uppercase tracking-[0.1em]">{item.name}</p>
										<p className="text-black/60">
											Size: {item.size} · Qty: {item.qty}
										</p>
										<p className="mt-auto">
											{formatPrice((item.salePrice ?? item.price) * item.qty)}
										</p>
									</div>
								</li>
							))}
						</ul>

						<div className="mt-5 flex justify-between border-t border-line pt-5 text-[15px]">
							<span className="uppercase tracking-[0.1em]">Subtotal</span>
							<span>{formatPrice(subtotal)}</span>
						</div>
						<p className="mt-2 text-[13px] text-black/60">
							Shipping calculated after order confirmation.
						</p>

						<button type="submit" className="btn-primary mt-6 w-full">
							Place order
						</button>
					</aside>
				</form>
			)}
		</section>
	);
}
