"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import {
	FaInstagram,
	FaFacebookF,
	FaYoutube,
	FaPinterestP,
	FaTiktok,
} from "react-icons/fa6";

const STORAGE_KEY = "silhouettePopupSeen";
const DELAY_MS = 4000; // kitne seconds baad popup khule

export default function NewsletterPopup() {
	const [open, setOpen] = useState(false);
	const [email, setEmail] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	// Timer: page load ke kuch seconds baad popup kholna
	useEffect(() => {
		try {
			if (localStorage.getItem(STORAGE_KEY)) return;
		} catch {}

		const timer = setTimeout(() => setOpen(true), DELAY_MS);
		return () => clearTimeout(timer);
	}, []);

	// Escape key se band karna + scroll lock
	useEffect(() => {
		if (!open) return;

		function onKey(e) {
			if (e.key === "Escape") close();
		}
		document.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";

		return () => {
			document.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [open]);

	function markSeen() {
		try {
			localStorage.setItem(STORAGE_KEY, "1");
		} catch {}
	}

	function close() {
		markSeen();
		setOpen(false);
	}

	function handleSubmit(e) {
		e.preventDefault();

		const valid = /^\S+@\S+\.\S+$/.test(email.trim());
		if (!valid) {
			setError("Please enter a valid email address.");
			return;
		}

		setError("");
		// TODO (Friday): email ko backend / newsletter database mein save karna
		setSubmitted(true);
		markSeen();
	}

	if (!open) return null;

	return (
		<div
			className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4"
			onClick={close}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-labelledby="newsletter-title"
				onClick={(e) => e.stopPropagation()}
				className="relative grid w-full max-w-[860px] overflow-hidden bg-white md:grid-cols-2"
			>
				{/* Close button */}
				<button
					onClick={close}
					aria-label="Close"
					className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white"
				>
					<X size={20} />
				</button>

				{/* Left: text + form */}
				<div className="flex flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
					{submitted ? (
						<>
							<h2
								id="newsletter-title"
								className="text-[18px] font-semibold tracking-[0.15em]"
							>
								THANK YOU FOR SUBSCRIBING!
							</h2>
							<p className="mt-4 text-[15px] leading-relaxed text-neutral-700">
								Aap ko 5% discount code jald mil jayega.
							</p>
							<button
								onClick={close}
								className="mt-8 bg-black px-10 py-3 text-[13px] tracking-[0.3em] text-white"
							>
								CONTINUE SHOPPING
							</button>
						</>
					) : (
						<>
							<h2
								id="newsletter-title"
								className="text-[18px] font-semibold leading-snug tracking-[0.15em]"
							>
								SUBSCRIBE OUR NEWSLETTER TO GET 5% OFF
							</h2>

							<p className="mt-5 text-[15px] leading-relaxed text-neutral-700">
								Sign up to our newsletter today and get exclusive access to our
								upcoming collections, deals and discounts.
							</p>

							<form
								onSubmit={handleSubmit}
								className="mt-7 flex w-full max-w-[360px]"
							>
								<input
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="Enter your email"
									aria-label="Email address"
									className="min-w-0 flex-1 border border-neutral-300 px-4 py-3 text-[15px] outline-none focus:border-black"
								/>
								<button
									type="submit"
									aria-label="Subscribe"
									className="flex w-14 items-center justify-center bg-black text-white"
								>
									<ArrowRight size={20} />
								</button>
							</form>

							{error && <p className="mt-2 text-[13px] text-sale">{error}</p>}

							<Link
								href="/collections/best-sellers"
								onClick={close}
								className="mt-6 bg-black px-10 py-3 text-[13px] tracking-[0.3em] text-white"
							>
								SHOP NOW
							</Link>

							<div className="mt-8 flex items-center gap-5 text-[20px]">
								<a href="#" aria-label="Instagram">
									<FaInstagram />
								</a>
								<a href="#" aria-label="Facebook">
									<FaFacebookF />
								</a>
								<a href="#" aria-label="YouTube">
									<FaYoutube />
								</a>
								<a href="#" aria-label="Pinterest">
									<FaPinterestP />
								</a>
								<a href="#" aria-label="TikTok">
									<FaTiktok />
								</a>
							</div>
						</>
					)}
				</div>

				{/* Right: image (mobile par chhup jayegi) */}
				<div className="relative hidden md:block">
					<Image
						src="/popup.webp"
						alt="Silhouette collection"
						fill
						sizes="430px"
						className="object-cover"
					/>
				</div>
			</div>
		</div>
	);
}
