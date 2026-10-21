import Image from "next/image";
import Link from "next/link";
import { spotted } from "@/data/spotted";

export const metadata = {
	title: "Spotted | Silhouette",
};

export default function SpottedPage() {
	return (
		<section className="site-container py-12">
			<h1 className="mb-10 text-center text-[28px] tracking-[0.2em]">
				Spotted
			</h1>

			<div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
				{spotted.map((c) => (
					<div
						key={c.id}
						className="flex flex-col items-center border border-line p-3 text-center"
					>
						<div className="relative aspect-[3/4] w-full overflow-hidden">
							<Image
								src={c.image}
								alt={c.name}
								fill
								sizes="(min-width: 768px) 25vw, 50vw"
								className="object-cover"
							/>
						</div>

						<h2 className="mt-4 text-[16px] tracking-[0.15em]">{c.name}</h2>

						<Link href={c.link} className="btn-primary mt-4">
							Shop Now
						</Link>
					</div>
				))}
			</div>
		</section>
	);
}
