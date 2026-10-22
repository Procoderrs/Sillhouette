"use client";

import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import SearchOverlay from "../../../components/layout/SearchOverLay";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { menu, topLinks } from "@/data/menu";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";

const navLink =
	"relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100";

export default function Header() {
	const [openSlug, setOpenSlug] = useState(null);
	const [mounted, setMounted] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);

	const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
	const setCartOpen = useCartDrawer((s) => s.setOpen);

	useEffect(() => setMounted(true), []);

	const [sale, maahi, ...otherLinks] = topLinks;

	// Accessories screenshot mein sab se aakhir mein hai, is liye alag rakha hai
	const accessories = menu.find((m) => m.label === "Accessories");
	const dropdowns = menu.filter((m) => m.label !== "Accessories");

	const renderDropdown = (item) => (
		<div
			key={item.slug}
			className="relative"
			onMouseEnter={() => setOpenSlug(item.slug)}
			onMouseLeave={() => setOpenSlug(null)}
		>
			<Link
				href={`/collections/${item.slug}`}
				className={`${navLink} flex items-center`}
			>
				{item.label}
				<RiArrowDropDownLine size={22} className="-ml-1" />
			</Link>
			{openSlug === item.slug && <MegaMenu item={item} />}
		</div>
	);

	return (
		<header className="bg-white border-b border-line">
			<div className="site-container flex items-center justify-between py-4">
				<Link href="/">
					<Image
						src="/logo.avif"
						alt="Silhouette"
						width={160}
						height={48}
						priority
						style={{ width: 160, height: "auto" }}
					/>
				</Link>

				<nav className="hidden lg:flex flex-1 flex-wrap items-center justify-center gap-x-5 gap-y-3 px-8 text-[15px] uppercase">
					<Link
						href={`/collections/${sale.slug}`}
						className={`${navLink} blink text-sale`}
					>
						{sale.label}
					</Link>

					<Link href={`/collections/${maahi.slug}`} className={navLink}>
						{maahi.label}
					</Link>

					{dropdowns.map(renderDropdown)}

					{otherLinks.map((l) => (
						<Link
							key={l.slug}
							href={l.href ?? `/collections/${l.slug}`}
							className={navLink}
						>
							{l.label}
						</Link>
					))}

					{accessories && renderDropdown(accessories)}
				</nav>

				<div className="flex items-center gap-4">
					<MobileMenu />

					<Link href="/account/login" aria-label="Account">
						<User size={20} strokeWidth={1.5} />
					</Link>

					<button
						type="button"
						onClick={() => setSearchOpen(true)}
						aria-label="Search"
					>
						<Search size={20} strokeWidth={1.5} />
					</button>

					<button
						type="button"
						onClick={() => setCartOpen(true)}
						aria-label="Cart"
						className="relative"
					>
						<ShoppingBag size={20} strokeWidth={1.5} />
						{mounted && count > 0 && (
							<span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-dot" />
						)}
					</button>
				</div>
			</div>

			<SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
		</header>
	);
}
