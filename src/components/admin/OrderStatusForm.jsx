"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ORDER_STATUSES, ORDER_LABELS } from "@/lib/orderStatus";

export default function OrderStatusForm({ orderId, currentStatus }) {
	const router = useRouter();
	const [status, setStatus] = useState(currentStatus);
	const [note, setNote] = useState("");
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");

	async function handleSave(e) {
		e.preventDefault();
		setSaving(true);
		setMessage("");

		const res = await fetch(`/api/admin/orders/${orderId}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ status, note }),
		});
		const data = await res.json().catch(() => null);
		setSaving(false);

		if (!res.ok) {
			setMessage(data?.message || "Could not update the status");
			return;
		}

		setNote("");
		setMessage("Status updated");
		router.refresh();
	}

	return (
		<form onSubmit={handleSave} className="space-y-4">
			<div>
				<label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-600">
					Status
				</label>
				<select
					value={status}
					onChange={(e) => setStatus(e.target.value)}
					className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
				>
					{ORDER_STATUSES.map((s) => (
						<option key={s} value={s}>
							{ORDER_LABELS[s]}
						</option>
					))}
				</select>
			</div>

			<div>
				<label className="mb-1.5 block text-[11px] uppercase tracking-[0.15em] text-neutral-600">
					Note (optional)
				</label>
				<input
					value={note}
					onChange={(e) => setNote(e.target.value)}
					placeholder="e.g. Dispatched via TCS, tracking 12345"
					className="w-full border border-neutral-300 bg-white px-3 py-2.5 text-[14px]"
				/>
			</div>

			{message && <p className="text-[13px] text-neutral-600">{message}</p>}

			<button
				type="submit"
				disabled={saving}
				className="btn-primary w-full disabled:opacity-50"
			>
				{saving ? "Saving..." : "Update status"}
			</button>
		</form>
	);
}
