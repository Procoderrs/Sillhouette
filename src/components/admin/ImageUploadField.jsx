"use client";

import { useState } from "react";

export default function ImageUploadField({ label, value, onChange, error }) {
	const [uploading, setUploading] = useState(false);
	const [uploadError, setUploadError] = useState("");

	async function handleFile(e) {
		const file = e.target.files?.[0];
		if (!file) return;

		setUploading(true);
		setUploadError("");
		try {
			const body = new FormData();
			body.append("file", file);

			const res = await fetch("/api/admin/uploads", { method: "POST", body });
			const data = await res.json().catch(() => ({}));

			if (!res.ok) {
				setUploadError(data.message || "Upload failed");
				return;
			}
			onChange(data.data.url);
		} catch {
			setUploadError("Could not reach server");
		} finally {
			setUploading(false);
			e.target.value = "";
		}
	}

	return (
		<div>
			<p className="mb-1 block text-[12px] uppercase tracking-[0.12em]">
				{label}
			</p>
			<div className="flex items-start gap-4">
				<div className="flex h-24 w-20 shrink-0 items-center justify-center overflow-hidden border border-dashed border-neutral-400 bg-soft-2">
					{value ? (
						<img src={value} alt="" className="h-full w-full object-cover" />
					) : (
						<span className="text-[11px] text-neutral-500">No image</span>
					)}
				</div>

				<div className="flex-1 space-y-2">
					<div className="flex items-center gap-3">
						<label className="inline-block cursor-pointer border border-black px-3 py-1.5 text-[12px] uppercase tracking-[0.12em]">
							{uploading ? "Uploading..." : "Choose image"}
							<input
								type="file"
								accept="image/jpeg,image/png,image/webp"
								className="hidden"
								disabled={uploading}
								onChange={handleFile}
							/>
						</label>
						{value && (
							<button
								type="button"
								onClick={() => onChange("")}
								className="text-[12px] underline"
							>
								Remove
							</button>
						)}
					</div>

					<input
						className="w-full border border-neutral-300 bg-white px-3 py-2 text-[13px] outline-none focus:border-black"
						value={value}
						placeholder="Or paste an image URL"
						onChange={(e) => onChange(e.target.value)}
					/>

					{uploadError && (
						<p className="text-[12px] text-sale">{uploadError}</p>
					)}
					{error && <p className="text-[12px] text-sale">{error}</p>}
				</div>
			</div>
		</div>
	);
}
