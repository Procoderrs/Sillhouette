import Link from "next/link";

export default function MegaMenu({ item }) {
	return (
		<div className="absolute left-0 top-8 z-50 min-w-[260px] bg-white px-6 py-3 shadow-md">
			<ul className="flex flex-col gap-4">
				{item.children.map((child) => (
					<li key={child.slug}>
						<Link
							href={`/collections/${child.slug}`}
							className={`whitespace-nowrap text-[15px] hover:underline ${
								child.highlight ? "text-sale" : ""
							}`}
						>
							{child.label}
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
