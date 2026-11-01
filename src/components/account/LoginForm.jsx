"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const field =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

const labelClass = "mb-2 block text-[13px] uppercase tracking-[0.25em]";

export default function LoginForm() {
	const router = useRouter();

	// Login state
	const [view, setView] = useState("login");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");
	const [loading, setLoading] = useState(false);

	// Reset state
	const [resetStep, setResetStep] = useState("email"); // "email" ya "confirm"
	const [resetEmail, setResetEmail] = useState("");
	const [resetCode, setResetCode] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [resetError, setResetError] = useState("");
	const [resetMessage, setResetMessage] = useState("");
	const [resetLoading, setResetLoading] = useState(false);

	async function handleLogin(e) {
		e.preventDefault();
		setError("");
		setNotice("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email, password }),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				setError(data.message || "Login failed");
				return;
			}

			// Middleware ne jo "next" diya tha, wahan bhejein (sirf same site ka path)
			const next = new URLSearchParams(window.location.search).get("next");
			const safeNext =
				next && next.startsWith("/") && !next.startsWith("//") ? next : null;

			const target =
				safeNext || (data.data.role === "admin" ? "/admin" : "/account");

			router.push(target);
			router.refresh();
		} catch (err) {
			console.error("Login request failed:", err);
			setError("Network error, please try again");
		} finally {
			setLoading(false);
		}
	}

	// Step 1: code mangwana
	async function handleRequestCode(e) {
		e.preventDefault();
		setResetError("");
		setResetLoading(true);

		try {
			await fetch("/api/auth/forgot-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: resetEmail }),
			});

			// Server hamesha same response deta hai, is liye hum bhi same step dikhayein
			setResetMessage(
				"If this email is registered, a 6-digit code has been sent.",
			);
			setResetStep("confirm");
		} catch (err) {
			console.error("Forgot password request failed:", err);
			setResetError("Network error, please try again");
		} finally {
			setResetLoading(false);
		}
	}

	// Step 2: code aur naya password bhejna
	async function handleResetPassword(e) {
		e.preventDefault();
		setResetError("");
		setResetLoading(true);

		try {
			const res = await fetch("/api/auth/reset-password", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: resetEmail,
					code: resetCode,
					newPassword,
				}),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				// Validation errors ho to pehla error dikhayein
				const firstFieldError = data.errors
					? Object.values(data.errors)[0]
					: null;
				setResetError(firstFieldError || data.message || "Reset failed");
				return;
			}

			// Kamyab reset: login view par wapas, aur success message
			setNotice("Your password has been reset. Please log in.");
			resetAndBackToLogin();
		} catch (err) {
			console.error("Reset password request failed:", err);
			setResetError("Network error, please try again");
		} finally {
			setResetLoading(false);
		}
	}

	function resetAndBackToLogin() {
		setView("login");
		setResetStep("email");
		setResetEmail("");
		setResetCode("");
		setNewPassword("");
		setResetError("");
		setResetMessage("");
	}

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-md">
				<h1 className="mb-12 text-center text-[28px] tracking-[0.2em]">
					{view === "login" ? "LOGIN" : "RESET PASSWORD"}
				</h1>

				{view === "login" && (
					<>
						{notice && (
							<p className="mb-6 text-center text-[14px] text-black">
								{notice}
							</p>
						)}

						<form onSubmit={handleLogin} className="space-y-6">
							<div>
								<label htmlFor="email" className={labelClass}>
									Email
								</label>
								<input
									id="email"
									type="email"
									required
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									className={field}
								/>
							</div>

							<div>
								<label htmlFor="password" className={labelClass}>
									Password
								</label>
								<input
									id="password"
									type="password"
									required
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className={field}
								/>
							</div>

							{error && <p className="text-[13px] text-sale">{error}</p>}

							<button
								type="submit"
								disabled={loading}
								className="btn-primary w-full disabled:opacity-60"
							>
								{loading ? "Please wait..." : "Sign in"}
							</button>

							<div className="text-center">
								<button
									type="button"
									onClick={() => {
										setNotice("");
										setView("reset");
									}}
									className="cursor-pointer text-[15px] underline"
								>
									Forgot password?
								</button>
							</div>
						</form>

						<p className="mt-6 text-center text-[15px]">
							<Link href="/account/register" className="underline">
								Create account
							</Link>
						</p>
					</>
				)}

				{view === "reset" && resetStep === "email" && (
					<form onSubmit={handleRequestCode} className="space-y-6">
						<p className="text-center text-[15px]">
							Enter your email and we will send you a 6-digit code.
						</p>

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

						{resetError && (
							<p className="text-[13px] text-sale">{resetError}</p>
						)}

						<button
							type="submit"
							disabled={resetLoading}
							className="btn-primary w-full disabled:opacity-60"
						>
							{resetLoading ? "Please wait..." : "Send code"}
						</button>

						<div className="text-center">
							<button
								type="button"
								onClick={resetAndBackToLogin}
								className="cursor-pointer text-[15px] underline"
							>
								Cancel
							</button>
						</div>
					</form>
				)}

				{view === "reset" && resetStep === "confirm" && (
					<form onSubmit={handleResetPassword} className="space-y-6">
						<p className="text-center text-[15px]">{resetMessage}</p>

						<div>
							<label htmlFor="resetCode" className={labelClass}>
								6-digit code
							</label>
							<input
								id="resetCode"
								type="text"
								inputMode="numeric"
								maxLength={6}
								required
								value={resetCode}
								onChange={(e) =>
									setResetCode(e.target.value.replace(/\D/g, ""))
								}
								className={field}
							/>
						</div>

						<div>
							<label htmlFor="newPassword" className={labelClass}>
								New password
							</label>
							<input
								id="newPassword"
								type="password"
								required
								minLength={8}
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								className={field}
							/>
						</div>

						{resetError && (
							<p className="text-[13px] text-sale">{resetError}</p>
						)}

						<button
							type="submit"
							disabled={resetLoading}
							className="btn-primary w-full disabled:opacity-60"
						>
							{resetLoading ? "Please wait..." : "Reset password"}
						</button>

						<div className="text-center">
							<button
								type="button"
								onClick={resetAndBackToLogin}
								className="cursor-pointer text-[15px] underline"
							>
								Cancel
							</button>
						</div>
					</form>
				)}
			</div>
		</section>
	);
}

/* 






*/
