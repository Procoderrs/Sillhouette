"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProductGallery({ images, name }) {
	const [active, setActive] = useState(0);

	return (
		<div className="flex flex-col-reverse gap-3 md:flex-row md:items-start">
			<div className="flex gap-3 md:flex-col">
				{images.map((src, i) => (
					<button
						key={src + i}
						type="button"
						onClick={() => setActive(i)}
						className={`relative h-20 w-16 shrink-0 border ${
							i === active ? "border-black" : "border-line"
						}`}
					>
						<Image
							src={src}
							alt={`${name} ${i + 1}`}
							fill
							sizes="64px"
							className="object-cover"
						/>
					</button>
				))}
			</div>

			<div className="relative aspect-[3/4] flex-1 overflow-hidden bg-soft">
				<Image
					src={images[active]}
					alt={name}
					fill
					priority
					sizes="(min-width: 768px) 50vw, 100vw"
					className="object-cover"
				/>
			</div>
		</div>
	);
}
