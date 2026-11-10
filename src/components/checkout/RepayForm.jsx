"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
	Elements,
	PaymentElement,
	useElements,
	useStripe,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
	process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
);

const PAYMENT_OPTIONS = {
	wallets: { applePay: "never", googlePay: "never" },
};

export default function RepayForm({ orderId, token }) {
	const [clientSecret, setClientSecret] = useState(null);
	const [error, setError] = useState("");

	// Server se is order ka client secret lein
	useEffect(() => {
		let cancelled = false;

		fetch(`/api/orders/${orderId}/repay`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ token }),
		})
			.then((res) => res.json())
			.then((data) => {
				if (cancelled) return;
				if (data.success) setClientSecret(data.data.clientSecret);
				else setError(data.message || "Payment is not available");
			})
			.catch(() => {
				if (!cancelled) setError("Could not load the payment form");
			});

		return () => {
			cancelled = true;
		};
	}, [orderId, token]);

	if (error) return <p className="text-[14px] text-red-700">{error}</p>;
	if (!clientSecret)
		return (
			<p className="text-[14px] text-neutral-500">Loading payment form...</p>
		);

	return (
		<Elements stripe={stripePromise} options={{ clientSecret }}>
			<RepayFields
				clientSecret={clientSecret}
				orderId={orderId}
				token={token}
			/>
		</Elements>
	);
}

function RepayFields({ clientSecret, orderId, token }) {
	const stripe = useStripe();
	const elements = useElements();
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	async function handlePay(e) {
		e.preventDefault();
		if (!stripe || !elements) return;

		setSubmitting(true);
		setError("");

		const { error: submitError } = await elements.submit();
		if (submitError) {
			setError(submitError.message);
			setSubmitting(false);
			return;
		}

		const returnUrl = `${window.location.origin}/orders/${orderId}${
			token ? `?t=${token}` : ""
		}`;

		const { error: payError } = await stripe.confirmPayment({
			elements,
			clientSecret,
			confirmParams: { return_url: returnUrl },
			redirect: "if_required",
		});

		if (payError) {
			setError(payError.message);
			setSubmitting(false);
			return;
		}

		// Payment ho gayi: page refresh karein, status paid dikhega
		router.refresh();
	}

	return (
		<form onSubmit={handlePay} className="space-y-4">
			<div className="border border-neutral-300 bg-white p-5">
				<PaymentElement options={PAYMENT_OPTIONS} />
			</div>
			{error && (
				<p className="border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800">
					{error}
				</p>
			)}
			<button
				type="submit"
				disabled={submitting || !stripe}
				className="btn-primary w-full py-3 disabled:opacity-50"
			>
				{submitting ? "Processing..." : "Pay now"}
			</button>
		</form>
	);
}
