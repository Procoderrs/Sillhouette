"use client";

import Link from "next/link";
import { useState } from "react";

const field =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

export default function LoginForm() {
	const [form, setForm] = useState({ email: "", password: "" });

	const handleChange = (e) =>
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	// Friday ko yahan API call aayegi
	const handleSubmit = (e) => {
		e.preventDefault();
	};

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-md">
				<h1 className="mb-12 text-center text-[28px] tracking-[0.2em]">
					LOGIN
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div>
						<label
							htmlFor="email"
							className="mb-2 block text-[13px] uppercase tracking-[0.25em]"
						>
							Email
						</label>
						<input
							id="email"
							name="email"
							type="email"
							required
							value={form.email}
							onChange={handleChange}
							className={field}
						/>
					</div>

					<div>
						<div className="mb-2 flex items-center justify-between">
							<label
								htmlFor="password"
								className="text-[13px] uppercase tracking-[0.25em]"
							>
								Password
							</label>
							<Link
								href="/account/forgot-password"
								className="text-[14px] underline"
							>
								Forgot password?
							</Link>
						</div>
						<input
							id="password"
							name="password"
							type="password"
							required
							value={form.password}
							onChange={handleChange}
							className={field}
						/>
					</div>

					<button type="submit" className="btn-primary w-full">
						Sign in
					</button>
				</form>

				<p className="mt-6 text-center text-[15px]">
					<Link href="/account/register" className="underline">
						Create account
					</Link>
				</p>
			</div>
		</section>
	);
}
