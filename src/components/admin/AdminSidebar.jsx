"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
	{ label: "Dashboard", href: "/admin" },
	{ label: "Products", href: "/admin/products" },
	{ label: "Collections", href: "/admin/collections" },
	{ label: "Sale", href: "/admin/sale" },
	{ label: "Home sections", href: "/admin/home-sections" },
	/* { label: "Banners", href: "/admin/banners" }, */
	{ label: "Settings", href: "/admin/settings" },
];

export default function AdminSidebar() {
	const pathname = usePathname();

	return (
		<aside className="border-b border-line md:min-h-screen md:w-56 md:border-b-0 md:border-r">
			<nav className="flex gap-1 overflow-x-auto p-4 md:flex-col md:gap-2">
				{NAV.map((item) => {
					// "/admin" sirf exact match par active ho, warna sab pages par active dikhega
					const active =
						item.href === "/admin"
							? pathname === "/admin"
							: pathname.startsWith(item.href);

					return (
						<Link
							key={item.href}
							href={item.href}
							className={`whitespace-nowrap px-3 py-2 text-[13px] uppercase tracking-[0.12em] ${
								active ? "bg-black text-white" : "hover:bg-soft-2"
							}`}
						>
							{item.label}
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
