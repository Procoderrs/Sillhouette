"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import {
	FaInstagram,
	FaPlay,
	FaVolumeXmark,
	FaVolumeHigh,
	FaXmark,
} from "react-icons/fa6";
import { instagramItems } from "@/data/instagram";

function PostModal({ item, onClose }) {
	const [muted, setMuted] = useState(true);

	useEffect(() => {
		const onKey = (e) => e.key === "Escape" && onClose();
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={onClose}
		>
			<button
				aria-label="Close"
				onClick={onClose}
				className="absolute top-5 right-5 text-white"
			>
				<FaXmark size={28} />
			</button>

			<div
				className="grid w-full max-w-[1000px] grid-cols-1 bg-white md:grid-cols-2"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="relative aspect-[3/4] bg-black md:aspect-auto md:h-[80vh]">
					{item.type === "video" ? (
						<>
							<video
								key={item.id}
								src={item.media}
								autoPlay
								loop
								muted={muted}
								playsInline
								className="absolute inset-0 h-full w-full object-cover"
							/>
							<button
								aria-label={muted ? "Unmute" : "Mute"}
								onClick={() => setMuted((m) => !m)}
								className="absolute top-4 left-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white"
							>
								{muted ? (
									<FaVolumeXmark size={16} />
								) : (
									<FaVolumeHigh size={16} />
								)}
							</button>
						</>
					) : (
						<Image
							src={item.media}
							alt={item.caption}
							fill
							sizes="(min-width: 768px) 50vw, 100vw"
							className="object-cover"
						/>
					)}
				</div>

				<div className="flex flex-col p-6 md:p-8">
					<div className="flex items-center gap-3 border-b border-line pb-4">
						<Image
							src="/logo.avif"
							alt="Silhouette"
							width={40}
							height={40}
							className="h-10 w-10 object-contain"
						/>
						<span className="text-[15px]">sillhouete.official</span>
					</div>

					<div className="mt-6 flex-1 space-y-4 text-[14px] leading-relaxed">
						<p>{item.caption}</p>
						{item.shopUrl && (
							<p>
								Shop Now:{" "}
								<a href={item.shopUrl} className="break-all underline">
									{item.shopUrl}
								</a>
							</p>
						)}
						{item.hashtags && <p>{item.hashtags}</p>}
					</div>

					<p className="mt-6 border-t border-line pt-4 text-center text-[12px] text-black/60">
						{item.date}
					</p>
				</div>
			</div>
		</div>
	);
}

export default function InstagramGrid() {
	const [selected, setSelected] = useState(null);
	const close = useCallback(() => setSelected(null), []);

	return (
		<section className="py-12">
			<h2 className="mb-8 text-center text-[18px]">Follow Us on Instagram</h2>

			<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 px-4 md:px-6 ">
				{instagramItems.map((item) => (
					<button
						key={item.id}
						onClick={() => setSelected(item)}
						aria-label={`Open post ${item.id}`}
						className="group relative block aspect-square overflow-hidden bg-soft-2"
					>
						<Image
							src={item.poster}
							alt={item.caption}
							fill
							sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
							className="object-cover"
						/>

						{item.type === "video" ? (
							<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
								{item.type === "video" ? (
									<FaPlay
										size={26}
										className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
									/>
								) : (
									<FaInstagram
										size={32}
										className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
									/>
								)}
							</div>
						) : (
							<div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors duration-300 group-hover:bg-black/25">
								<FaInstagram
									size={32}
									className="text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
								/>
							</div>
						)}
					</button>
				))}
			</div>

			{selected && <PostModal item={selected} onClose={close} />}
		</section>
	);
}
