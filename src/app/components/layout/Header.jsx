"use client";

import MobileMenu from "./MobileMenu";
import MegaMenu from "./MegaMenu";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import { menu, topLinks } from "@/data/menu";
import { useCartStore } from "@/store/cartStore";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function Header() {
	const [openIndex, setOpenIndex] = useState(null);
	const [mounted, setMounted] = useState(false);

	const count = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0));

	useEffect(() => setMounted(true), []);

	const [sale, maahi, ...otherLinks] = topLinks;
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
					/>
				</Link>

				<nav className="hidden lg:flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[15px] uppercase">
					<Link href={`/collections/${sale.slug}`} className="blink text-sale">
						{sale.label}
					</Link>

					<Link href={`/collections/${maahi.slug}`}>{maahi.label}</Link>

					{menu.map((item, i) => (
						<div
							key={item.slug}
							className="relative"
							onMouseEnter={() => setOpenIndex(i)}
							onMouseLeave={() => setOpenIndex(null)}
						>
							<Link
								href={`/collections/${item.slug}`}
								className="flex items-center gap-1"
							>
								{item.label}
								<span className="text-[10px]">
									<RiArrowDropDownLine />
								</span>
							</Link>
							{openIndex === i && <MegaMenu item={item} />}
						</div>
					))}

					{otherLinks.map((l) => (
						<Link key={l.slug} href={`/collections/${l.slug}`}>
							{l.label}
						</Link>
					))}
				</nav>
				<div className="flex items-center gap-4">
					<MobileMenu />
					<Link href="/account" aria-label="Account">
						<User size={20} strokeWidth={1.5} />
					</Link>
					<button aria-label="Search">
						<Search size={20} strokeWidth={1.5} />
					</button>
					<Link href="/cart" aria-label="Cart" className="relative">
						<ShoppingBag size={20} strokeWidth={1.5} />
						{mounted && count > 0 && (
							<span className="absolute -top-1.5 -right-1.5 h-2.5 w-2.5 rounded-full bg-dot" />
						)}
					</Link>
				</div>
			</div>
		</header>
	);
}
