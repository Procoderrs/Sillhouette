"use client";

import Link from "next/link";
import { useState } from "react";

const field =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

const labelClass = "mb-2 block text-[13px] uppercase tracking-[0.25em]";

export default function LoginForm() {
	const [view, setView] = useState("login");
	const [form, setForm] = useState({ email: "", password: "" });
	const [resetEmail, setResetEmail] = useState("");
	const [resetSent, setResetSent] = useState(false);

	const handleChange = (e) =>
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

	// Friday ko yahan login API call aayegi
	const handleLogin = (e) => {
		e.preventDefault();
	};

	// Friday ko yahan backend reset email bhejega
	const handleReset = (e) => {
		e.preventDefault();
		setResetSent(true);
	};

	const backToLogin = () => {
		setView("login");
		setResetSent(false);
	};

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-md">
				<h1 className="mb-12 text-center text-[28px] tracking-[0.2em]">
					LOGIN
				</h1>

				{view === "login" && (
					<>
						<form onSubmit={handleLogin} className="space-y-6">
							<div>
								<label htmlFor="email" className={labelClass}>
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
									<button
										type="button"
										onClick={() => setView("reset")}
										className="cursor-pointer text-[14px] underline"
									>
										Forgot password?
									</button>
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
					</>
				)}

				{view === "reset" && (
					<div className="text-center">
						<h2 className="mb-3 text-[20px] tracking-[0.2em]">
							RESET YOUR PASSWORD
						</h2>
						<p className="mb-8 text-[15px]">
							We will send you an email to reset your password.
						</p>

						{resetSent ? (
							<>
								<p className="mb-8 text-[15px]">
									If this email is registered with us, a reset link has been
									sent.
								</p>
								<button
									type="button"
									onClick={backToLogin}
									className="cursor-pointer text-[15px] underline"
								>
									Back to login
								</button>
							</>
						) : (
							<form onSubmit={handleReset} className="space-y-6 text-left">
								<div>
									<label htmlFor="resetEmail" className={labelClass}>
										Email
									</label>
									<input
										id="resetEmail"
										type="email"
										required
										value={resetEmail}
										onChange={(e) => setResetEmail(e.target.value)}
										className={field}
									/>
								</div>

								<button type="submit" className="btn-primary w-full">
									Submit
								</button>

								<div className="text-center">
									<button
										type="button"
										onClick={backToLogin}
										className="cursor-pointer text-[15px] underline"
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				)}
			</div>
		</section>
	);
}
