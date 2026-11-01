"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const KEYS = [
	"whatsappNumber",
	"bookingPhone",
	"supportEmail",
	"expressFee",
	"expressDays",
	"shippingNote",
	"instagram",
	"facebook",
	"youtube",
	"tiktok",
	"footerNote",
];

const field =
	"w-full border border-neutral-300 bg-white px-3 py-2 text-[14px] outline-none focus:border-black";
const label = "mb-1 block text-[12px] uppercase tracking-[0.12em]";

function Section({ title, children }) {
	return (
		<section className="space-y-5 border border-line bg-white p-6">
			<h2 className="text-[16px] uppercase tracking-[0.15em]">{title}</h2>
			{children}
		</section>
	);
}

function Input({
	name,
	text,
	hint,
	value,
	onChange,
	error,
	multiline,
	type = "text",
}) {
	const Tag = multiline ? "textarea" : "input";
	return (
		<div>
			<label className={label} htmlFor={name}>
				{text}
			</label>
			<Tag
				id={name}
				type={multiline ? undefined : type}
				rows={multiline ? 3 : undefined}
				className={field}
				value={value}
				onChange={(e) => onChange(name, e.target.value)}
			/>
			{hint && <p className="mt-1 text-[12px] text-neutral-500">{hint}</p>}
			{error && <p className="mt-1 text-[12px] text-sale">{error}</p>}
		</div>
	);
}

export default function SettingsForm({ settings }) {
	const router = useRouter();
	const [form, setForm] = useState(() =>
		Object.fromEntries(KEYS.map((k) => [k, settings[k] ?? ""])),
	);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState("");
	const [errors, setErrors] = useState({});

	function update(name, value) {
		setForm((prev) => ({ ...prev, [name]: value }));
	}

	async function handleSave() {
		setMessage("");
		setErrors({});
		setSaving(true);

		try {
			const res = await fetch("/api/admin/settings", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					...form,
					expressFee: Number(form.expressFee) || 0,
				}),
			});
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setErrors(data.errors || {});
				setMessage(data.message || "Settings could not be saved");
				return;
			}

			setMessage("Saved");
			router.refresh();
		} catch {
			setMessage("Could not connect to server");
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="max-w-4xl space-y-8">
			<div>
				<p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
					Admin
				</p>
				<h1 className="mt-1 text-[24px] uppercase tracking-[0.15em]">
					Settings
				</h1>
			</div>

			<Section title="Contact & WhatsApp">
				<div className="grid gap-5 md:grid-cols-2">
					<Input
						name="whatsappNumber"
						text="WhatsApp number"
						hint="Country code ke saath, jaise 923001234567"
						value={form.whatsappNumber}
						onChange={update}
						error={errors.whatsappNumber}
					/>
					<Input
						name="bookingPhone"
						text="Booking phone (top bar)"
						value={form.bookingPhone}
						onChange={update}
						error={errors.bookingPhone}
					/>
					<Input
						name="supportEmail"
						text="Support email"
						type="email"
						value={form.supportEmail}
						onChange={update}
						error={errors.supportEmail}
					/>
				</div>
			</Section>

			<Section title="Shipping & express">
				<div className="grid gap-5 md:grid-cols-2">
					<Input
						name="expressFee"
						text="Express fee (PKR)"
						type="number"
						value={form.expressFee}
						onChange={update}
						error={errors.expressFee}
					/>
					<Input
						name="expressDays"
						text="Express delivery time"
						hint="Jaise 5-6 working days"
						value={form.expressDays}
						onChange={update}
						error={errors.expressDays}
					/>

					<Input
						name="pkrPerUsd"
						text="PKR per 1 USD"
						type="number"
						hint="Checkout par USD amount isi rate se banega"
						value={form.pkrPerUsd}
						onChange={update}
						error={errors.pkrPerUsd}
					/>
				</div>
				<Input
					name="shippingNote"
					text="Shipping note (product page)"
					multiline
					value={form.shippingNote}
					onChange={update}
					error={errors.shippingNote}
				/>
			</Section>

			<Section title="Social links">
				<div className="grid gap-5 md:grid-cols-2">
					<Input
						name="instagram"
						text="Instagram"
						value={form.instagram}
						onChange={update}
						error={errors.instagram}
					/>
					<Input
						name="facebook"
						text="Facebook"
						value={form.facebook}
						onChange={update}
						error={errors.facebook}
					/>
					<Input
						name="youtube"
						text="YouTube"
						value={form.youtube}
						onChange={update}
						error={errors.youtube}
					/>
					<Input
						name="tiktok"
						text="TikTok"
						value={form.tiktok}
						onChange={update}
						error={errors.tiktok}
					/>
				</div>
			</Section>

			<Section title="Footer">
				<Input
					name="footerNote"
					text="Footer note"
					multiline
					value={form.footerNote}
					onChange={update}
					error={errors.footerNote}
				/>
			</Section>

			{message && (
				<p
					className={`text-[14px] ${message === "Saved" ? "text-black" : "text-sale"}`}
				>
					{message}
				</p>
			)}

			<button
				type="button"
				onClick={handleSave}
				disabled={saving}
				className="btn-primary w-full disabled:opacity-50"
			>
				{saving ? "Saving..." : "Save settings"}
			</button>
		</div>
	);
}
