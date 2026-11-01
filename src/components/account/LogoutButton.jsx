"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	async function handleLogout() {
		setLoading(true);
		try {
			await fetch("/api/auth/logout", { method: "POST" });
			router.push("/account/login");
			router.refresh();
		} catch (err) {
			console.error("Logout request failed:", err);
		} finally {
			setLoading(false);
		}
	}

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={loading}
			className="btn-primary w-full disabled:opacity-60"
		>
			{loading ? "Logging out..." : "Log out"}
		</button>
	);
}
