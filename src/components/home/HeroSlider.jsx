"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

function SlideContent({ s }) {
	return (
		<div className="absolute inset-0 flex flex-col items-end justify-center pr-[10%] text-right text-black"></div>
	);
}

export default function HeroSlider({ slides }) {
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) {
		const first = slides[0];
		return (
			<div className="relative w-full">
				<Image
					src={first.image}
					alt={first.alt}
					width={1920}
					height={900}
					className="w-full h-auto"
					priority
				/>
			</div>
		);
	}

	return (
		<Swiper
			modules={[Autoplay, Pagination]}
			loop={slides.length > 1}
			autoplay={{ delay: 5000, disableOnInteraction: false }}
			pagination={{ clickable: true }}
			className="hero-swiper"
		>
			{slides.map((s, i) => (
				<SwiperSlide key={s.id}>
					<div className="relative w-full">
						<Image
							src={s.image}
							alt={s.alt}
							width={1920}
							height={900}
							className="w-full h-auto"
							priority={i === 0}
						/>
						<SlideContent s={s} />
					</div>
				</SwiperSlide>
			))}
		</Swiper>
	);
}
