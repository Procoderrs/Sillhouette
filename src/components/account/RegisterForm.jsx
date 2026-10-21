"use client";

import { useState } from "react";

const field =
	"w-full border border-line bg-white px-4 py-3 text-[15px] outline-none focus:border-black";

const fields = [
	{ name: "firstName", label: "First name", type: "text" },
	{ name: "lastName", label: "Last name", type: "text" },
	{ name: "email", label: "Email", type: "email" },
	{ name: "password", label: "Password", type: "password" },
];

export default function RegisterForm() {
	const [form, setForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});

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
					CREATE ACCOUNT
				</h1>

				<form onSubmit={handleSubmit} className="space-y-6">
					{fields.map((f) => (
						<div key={f.name}>
							<label
								htmlFor={f.name}
								className="mb-2 block text-[13px] uppercase tracking-[0.25em]"
							>
								{f.label}
							</label>
							<input
								id={f.name}
								name={f.name}
								type={f.type}
								required
								value={form[f.name]}
								onChange={handleChange}
								className={field}
							/>
						</div>
					))}

					<button type="submit" className="btn-primary w-full">
						Create
					</button>
				</form>
			</div>
		</section>
	);
}
