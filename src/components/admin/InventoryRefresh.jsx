"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Page ko har kuch seconds mein refresh karta hai taake stock live dikhe
export default function InventoryRefresh({ seconds = 30 }) {
	const router = useRouter();

	useEffect(() => {
		const timer = setInterval(() => router.refresh(), seconds * 1000);
		return () => clearInterval(timer);
	}, [router, seconds]);

	return null;
}
