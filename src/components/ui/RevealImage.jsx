"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function RevealImage({ src, alt, sizes, className = "" }) {
	const ref = useRef(null);
	const [inView, setInView] = useState(false);
	const [loaded, setLoaded] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;

		const io = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setInView(true);
					io.disconnect();
				}
			},
			{ rootMargin: "200px" },
		);

		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div ref={ref} className={`absolute inset-0 ${className}`}>
			{/* Placeholder: image load hone tak dikhta hai */}
			<div
				className={`absolute inset-0 bg-soft-2 transition-opacity duration-500 ${
					loaded ? "opacity-0" : "animate-pulse opacity-100"
				}`}
			/>

			{inView && (
				<Image
					src={src}
					alt={alt}
					fill
					sizes={sizes}
					onLoad={() => setLoaded(true)}
					className={`object-cover transition-all duration-700 ${
						loaded
							? "scale-100 opacity-100 blur-0"
							: "scale-105 opacity-0 blur-md"
					}`}
				/>
			)}
		</div>
	);
}
