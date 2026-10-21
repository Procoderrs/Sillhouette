import Link from "next/link";
import Image from "next/image";
import { events } from "@/data/events";

export default function ShopByEvent() {
	return (
		<section className="site-container py-12">
			<h2 className="mb-8 text-center text-[18px]">Shop by Event</h2>

			<div className="grid grid-cols-2 gap-[17px] md:grid-cols-3 lg:grid-cols-5">
				{events.map((e) => (
					<Link
						key={e.slug}
						href={`/collections/${e.slug}`}
						className="group relative block aspect-[3/4] overflow-hidden bg-soft-2"
					>
						<Image
							src={e.image}
							alt={e.label}
							fill
							sizes="(min-width: 1024px) 20vw, (min-width: 768px) 40vw, 50vw"
							className="object-cover transition-transform duration-500 group-hover:scale-105"
						/>
						<div className="absolute inset-x-0 bottom-5 flex justify-center">
							<span className="bg-white px-3 py-1.5 text-[13px] uppercase tracking-[0.2em] text-black">
								{e.label}
							</span>
						</div>
					</Link>
				))}
			</div>
		</section>
	);
}
