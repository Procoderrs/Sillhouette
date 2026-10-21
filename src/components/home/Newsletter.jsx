"use client";

import { useState } from "react";

export default function Newsletter() {
	const [email, setEmail] = useState("");
	const [done, setDone] = useState(false);

	function handleSubmit(e) {
		e.preventDefault();
		if (!email) return;

		setDone(true);
		setEmail("");
	}

	return (
		<section className="border-b border-line bg-soft py-20">
			<div className="site-container text-center">
				<h2 className="text-[20px]">Subscribe to our Newsletter</h2>

				<p className="mx-auto mt-4 max-w-[600px] text-[15px]">
					Signup for our newsletter to stay up to date on sales and events.
				</p>

				{done ? (
					<p className="mt-8 text-[14px] uppercase tracking-[0.15em]">
						Thank you for subscribing
					</p>
				) : (
					<form
						onSubmit={handleSubmit}
						className="mx-auto mt-8 flex max-w-[480px] flex-col sm:flex-row"
					>
						<input
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							placeholder="Enter your email"
							className="flex-1 border border-line bg-white px-4 py-3 text-[14px] outline-none"
						/>
						<button type="submit" className="btn-primary sm:ml-0">
							Subscribe
						</button>
					</form>
				)}
			</div>
		</section>
	);
}
