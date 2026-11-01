"use client";

import MobileMenu from "./MobileMenu";
import SearchOverlay from "./SearchOverlay";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useCartStore } from "@/store/cartStore";
import { useCartDrawer } from "@/store/cartDrawerStore";

const navLink =
	"relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-black after:transition-transform after:duration-300 after:content-[''] hover:after:scale-x-100";

// Parent item: children ho to hover par dropdown dikhega
function NavItem({ item }) {
	const [open, setOpen] = useState(false);
	const children = item.children || [];

	if (children.length === 0) {
		return (
			<Link href={`/collections/${item.slug}`} className={navLink}>
				{item.name}
			</Link>
		);
	}

	return (
		<div
			className="relative"
			onMouseEnter={() => setOpen(true)}
			onMouseLeave={() => setOpen(false)}
		>
			<Link
				href={`/collections/${item.slug}`}
				className={`${navLink} flex items-center`}
			>
				{item.name}
				<RiArrowDropDownLine size={22} className="-ml-1" />
			</Link>

			{open && (
				<div className="absolute left-0 top-full z-30 min-w-[200px] border border-line bg-white py-3 shadow-sm">
					{children.map((c) => (
						<Link
							key={c._id}
							href={`/collections/${item.slug}/${c.slug}`}
							className="block px-5 py-2 text-[14px] uppercase hover:bg-soft-2"
						>
							{c.name}
						</Link>
					))}
				</div>
			)}
		</div>
	);
}

export default function Header({ user, navigation = [] }) {
	const [mounted, setMounted] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);

	const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));
	const setCartOpen = useCartDrawer((s) => s.setOpen);

	useEffect(() => setMounted(true), []);

	// Sale collection ka item alag, baki parents header mein tarteeb se
	const saleItem = navigation.find((p) => p.isSale);
	const parents = navigation.filter((p) => !p.isSale);

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
					{saleItem && (
						<Link
							href={`/collections/${saleItem.slug}`}
							className={`${navLink} blink text-sale`}
						>
							{saleItem.name}
						</Link>
					)}

					{parents.map((item) => (
						<NavItem key={item._id} item={item} />
					))}
				</nav>

				<div className="flex items-center gap-4">
					<MobileMenu />

					<Link
						href={user ? "/account" : "/account/login"}
						aria-label="Account"
						className="flex items-center gap-2"
					>
						<User size={20} strokeWidth={1.5} />
						{user && (
							<span className="hidden text-[13px] uppercase md:inline">
								{user.firstName}
							</span>
						)}
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
