"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const field =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

const labelClass = "mb-2 block text-[13px] uppercase tracking-[0.25em]";

const fields = [
	{
		name: "firstName",
		label: "First name",
		type: "text",
		autoComplete: "given-name",
	},
	{
		name: "lastName",
		label: "Last name",
		type: "text",
		autoComplete: "family-name",
	},
	{ name: "email", label: "Email", type: "email", autoComplete: "email" },
	{
		name: "password",
		label: "Password",
		type: "password",
		autoComplete: "new-password",
	},
];

const emptyForm = { firstName: "", lastName: "", email: "", password: "" };

export default function RegisterForm() {
	const router = useRouter();
	const [form, setForm] = useState(emptyForm);
	const [fieldErrors, setFieldErrors] = useState({});
	const [formError, setFormError] = useState("");
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	async function handleSubmit(e) {
		e.preventDefault();
		setFieldErrors({});
		setFormError("");
		setLoading(true);

		try {
			const res = await fetch("/api/auth/register", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();

			if (!res.ok || !data.success) {
				// Validation errors field ke hisaab se dikhayein
				if (data.errors) setFieldErrors(data.errors);
				setFormError(data.message || "Registration failed");
				return;
			}

			router.push("/account");
			router.refresh();
		} catch (err) {
			console.error("Register request failed:", err);
			setFormError("Network error, please try again");
		} finally {
			setLoading(false);
		}
	}

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-md">
				<h1 className="mb-12 text-center text-[28px] tracking-[0.2em]">
					CREATE ACCOUNT
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					{fields.map((f) => (
						<div key={f.name}>
							<label htmlFor={f.name} className={labelClass}>
								{f.label}
							</label>
							<input
								id={f.name}
								name={f.name}
								type={f.type}
								autoComplete={f.autoComplete}
								required
								value={form[f.name]}
								onChange={handleChange}
								className={field}
							/>
							{fieldErrors[f.name] && (
								<p className="mt-2 text-[13px] text-sale">
									{fieldErrors[f.name]}
								</p>
							)}
						</div>
					))}

					{formError && <p className="text-[13px] text-sale">{formError}</p>}

					<button
						type="submit"
						disabled={loading}
						className="btn-primary w-full disabled:opacity-60"
					>
						{loading ? "Please wait..." : "Create account"}
					</button>
				</form>

				<p className="mt-6 text-center text-[15px]">
					Already have an account?{" "}
					<Link href="/account/login" className="underline">
						Login
					</Link>
				</p>
			</div>
		</section>
	);
}
