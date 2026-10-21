import Image from "next/image";

function Media({ src, image, alt }) {
	return (
		<div className="relative aspect-[3/4] overflow-hidden bg-soft-2">
			{src ? (
				<video
					src={src}
					autoPlay
					muted
					loop
					playsInline
					className="absolute inset-0 h-full w-full object-cover"
				/>
			) : (
				<Image
					src={image}
					alt={alt}
					fill
					sizes="(min-width: 768px) 33vw, 100vw"
					className="object-cover"
				/>
			)}
		</div>
	);
}

export default function ShowcaseGrid({ left, center, right }) {
	return (
		<section className="w-full py-12">
			<div className="grid grid-cols-3">
				<div className="order-1">
					<Media src={left.src} />
				</div>

				<div className="order-2">
					<Media image={center.image} alt={center.alt} />
				</div>

				<div className="order-3">
					<Media src={right.src} />
				</div>
			</div>
		</section>
	);
}
