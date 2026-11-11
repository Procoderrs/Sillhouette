"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ACCENT = "#1f7a6e";
const MAX_IMAGES = 3;

const label =
	"mb-2 block text-center text-[11px] uppercase tracking-[0.25em] text-neutral-700";
const field =
	"w-full border border-neutral-300 bg-white px-4 py-3 text-[14px] outline-none focus:border-[#1f7a6e]";

function Stars({ value, onChange, size = "text-[16px]" }) {
	return (
		<div
			className={`flex justify-center gap-1 ${size}`}
			style={{ color: ACCENT }}
		>
			{[1, 2, 3, 4, 5].map((n) => (
				<button
					key={n}
					type="button"
					disabled={!onChange}
					onClick={() => onChange?.(n)}
					aria-label={`${n} star`}
					className="leading-none"
				>
					{n <= value ? "★" : "☆"}
				</button>
			))}
		</div>
	);
}

export default function ReviewSection({
	productId,
	avgRating = 0,
	reviewCount = 0,
	reviews = [],
	loggedInName = null,
}) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [rating, setRating] = useState(0);
	const [title, setTitle] = useState("");
	const [comment, setComment] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [images, setImages] = useState([]);
	const [uploading, setUploading] = useState(false);
	const [website, setWebsite] = useState(""); // honeypot, user ko nahi dikhega
	const [error, setError] = useState("");
	const [message, setMessage] = useState("");
	const [submitting, setSubmitting] = useState(false);

	function resetForm() {
		setRating(0);
		setTitle("");
		setComment("");
		setDisplayName("");
		setImages([]);
		setWebsite("");
	}

	async function handleFiles(e) {
		const files = Array.from(e.target.files || []);
		e.target.value = "";
		if (files.length === 0) return;

		const slots = MAX_IMAGES - images.length;
		if (slots <= 0) {
			setError(`You can add up to ${MAX_IMAGES} photos`);
			return;
		}

		setError("");
		setUploading(true);
		try {
			const uploaded = [];
			for (const file of files.slice(0, slots)) {
				const fd = new FormData();
				fd.append("file", file);
				const res = await fetch("/api/reviews/upload", {
					method: "POST",
					body: fd,
				});
				const data = await res.json();
				if (!res.ok || !data.success) {
					setError(data.message || "Upload failed");
					break;
				}
				uploaded.push(data.data.url);
			}
			setImages((prev) => [...prev, ...uploaded]);
		} catch {
			setError("Upload failed, please try again");
		} finally {
			setUploading(false);
		}
	}

	async function handleSubmit(e) {
		e.preventDefault();
		setError("");
		setMessage("");

		if (rating === 0) {
			setError("Please select a rating");
			return;
		}

		setSubmitting(true);
		try {
			const res = await fetch(`/api/reviews`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					productId,
					rating,
					title,
					comment,
					displayName: loggedInName ? "" : displayName,
					images,
					website,
				}),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				const first = data.errors ? Object.values(data.errors)[0] : null;
				setError(first || data.message || "Could not submit your review");
				return;
			}

			resetForm();
			setOpen(false);
			setMessage("Thank you! Your review has been posted.");
			router.refresh();
		} catch {
			setError("Network error, please try again");
		} finally {
			setSubmitting(false);
		}
	}

	return (
		<section className="mx-auto max-w-3xl space-y-10 border-t border-neutral-200 pt-12 text-center">
			<h2 className="text-[18px] uppercase tracking-[0.25em]">
				Customer reviews
			</h2>

			<div className="flex flex-col items-center gap-4 border-b border-neutral-200 pb-10">
				<Stars value={Math.round(avgRating)} />
				<p className="text-[14px] text-neutral-600">
					{reviewCount > 0
						? `${avgRating.toFixed(1)} out of 5 · ${reviewCount} review${reviewCount > 1 ? "s" : ""}`
						: "Be the first to write a review"}
				</p>
				<button
					type="button"
					onClick={() => {
						setOpen((o) => !o);
						setError("");
						setMessage("");
					}}
					className="px-8 py-3 text-[12px] uppercase tracking-[0.2em] text-white"
					style={{ background: ACCENT }}
				>
					{open ? "Cancel review" : "Write a review"}
				</button>
			</div>

			{message && (
				<p className="text-[14px]" style={{ color: ACCENT }}>
					{message}
				</p>
			)}

			{open && (
				<form
					onSubmit={handleSubmit}
					className="mx-auto max-w-xl space-y-6 text-left"
				>
					<h3 className="text-center text-[18px]">Write a review</h3>

					<div>
						<p className={label}>Rating</p>
						<Stars value={rating} onChange={setRating} size="text-[26px]" />
					</div>

					<div>
						<label className={label}>Review title</label>
						<input
							type="text"
							placeholder="Give your review a title"
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							maxLength={120}
							className={field}
						/>
					</div>

					<div>
						<label className={label}>Review content</label>
						<textarea
							rows={5}
							placeholder="Start writing here..."
							value={comment}
							onChange={(e) => setComment(e.target.value)}
							className={field}
						/>
					</div>

					<div>
						<p className={label}>Picture (optional)</p>
						<div className="flex flex-wrap justify-center gap-3">
							{images.map((url, i) => (
								<div
									key={url}
									className="relative h-24 w-24 border border-neutral-200"
								>
									<img
										src={url}
										alt=""
										className="h-full w-full object-cover"
									/>
									<button
										type="button"
										onClick={() =>
											setImages((prev) => prev.filter((_, idx) => idx !== i))
										}
										aria-label="Remove photo"
										className="absolute right-1 top-1 bg-white px-1.5 text-[13px] leading-none"
									>
										×
									</button>
								</div>
							))}

							{images.length < MAX_IMAGES && (
								<label className="flex h-24 w-24 cursor-pointer items-center justify-center border border-dashed border-neutral-400 text-[12px] text-neutral-500 hover:border-black">
									{uploading ? "Uploading..." : "+ Add"}
									<input
										type="file"
										accept="image/jpeg,image/png,image/webp"
										multiple
										disabled={uploading}
										onChange={handleFiles}
										className="hidden"
									/>
								</label>
							)}
						</div>
					</div>

					{loggedInName ? (
						<p className="text-center text-[13px] text-neutral-600">
							Posting as <span className="uppercase">{loggedInName}</span>
						</p>
					) : (
						<div>
							<label className={label}>Display name (optional)</label>
							<input
								type="text"
								placeholder="Anonymous"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
								maxLength={60}
								className={field}
							/>
						</div>
					)}

					{/* Honeypot: user ko nahi dikhega */}
					<input
						type="text"
						name="website"
						tabIndex={-1}
						autoComplete="off"
						value={website}
						onChange={(e) => setWebsite(e.target.value)}
						className="hidden"
					/>

					{error && (
						<p className="text-center text-[13px] text-red-700">{error}</p>
					)}

					<div className="flex justify-center">
						<button
							type="submit"
							disabled={submitting || uploading}
							className="px-10 py-3 text-[12px] uppercase tracking-[0.2em] text-white disabled:opacity-60"
							style={{ background: ACCENT }}
						>
							{submitting ? "Submitting..." : "Submit review"}
						</button>
					</div>
				</form>
			)}

			{reviews.length > 0 && (
				<ul className="space-y-6 text-left">
					{reviews.map((r) => (
						<li
							key={r._id}
							className="space-y-2 border-b border-neutral-200 pb-6"
						>
							<div className="flex items-center justify-between text-[13px]">
								<span className="uppercase tracking-[0.1em]">
									{r.displayName}
								</span>
								<span className="text-neutral-500">
									{new Date(r.createdAt).toLocaleDateString("en-PK")}
								</span>
							</div>
							<Stars value={r.rating} />
							{r.title && <p className="font-medium">{r.title}</p>}
							<p className="text-[14px] text-neutral-700">{r.comment}</p>
							{r.images?.length > 0 && (
								<div className="flex gap-2 pt-1">
									{r.images.map((src) => (
										<img
											key={src}
											src={src}
											alt=""
											className="h-20 w-20 object-cover"
										/>
									))}
								</div>
							)}
						</li>
					))}
				</ul>
			)}
		</section>
	);
}
