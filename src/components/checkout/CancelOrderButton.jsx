"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CancelOrderButton({ orderId, token }) {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	async function handleCancel() {
		if (
			!window.confirm(
				"Cancel this order? If you have paid, the amount will be refunded to your card.",
			)
		) {
			return;
		}

		setLoading(true);
		setError("");
		try {
			const res = await fetch(`/api/orders/${orderId}/cancel`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token }),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				setError(data.message || "Could not cancel the order");
				return;
			}

			router.refresh();
		} catch {
			setError("Network error, please try again");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="space-y-2">
			<button
				type="button"
				onClick={handleCancel}
				disabled={loading}
				className="border border-black px-6 py-3 text-[12px] uppercase tracking-[0.2em] disabled:opacity-50"
			>
				{loading ? "Cancelling..." : "Cancel order"}
			</button>
			{error && <p className="text-[13px] text-red-700">{error}</p>}
		</div>
	);
}
