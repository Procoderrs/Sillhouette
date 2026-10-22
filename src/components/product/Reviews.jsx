import { Star } from "lucide-react";
import { reviews, featuredReviews } from "@/data/reviews";

function Stars({ count }) {
	return (
		<div className="flex gap-0.5">
			{Array.from({ length: 5 }, (_, i) => (
				<Star
					key={i}
					size={16}
					className={i < count ? "fill-black text-black" : "text-black/20"}
				/>
			))}
		</div>
	);
}

export default function Reviews() {
	const total = reviews.length;
	const avg = total ? reviews.reduce((n, r) => n + r.rating, 0) / total : 0;
	const scores = [5, 4, 3, 2, 1];
	const counts = scores.map(
		(s) => reviews.filter((r) => r.rating === s).length,
	);

	return (
		<section className="site-container border-t border-line py-16">
			<h2 className="mb-10 text-center text-[24px] tracking-[0.2em]">
				CUSTOMER REVIEWS
			</h2>

			<div className="grid gap-8 md:grid-cols-3 md:items-center">
				<div className="text-center md:text-left">
					<Stars count={Math.round(avg)} />
					<p className="mt-2 text-[15px]">{avg.toFixed(2)} out of 5</p>
					<p className="text-[14px] text-black/60">Based on {total} reviews</p>
				</div>

				<div className="space-y-2">
					{scores.map((s, i) => (
						<div key={s} className="flex items-center gap-3 text-[13px]">
							<span className="flex w-16 items-center gap-1">
								{s}
								<Star size={12} className="fill-black text-black" />
							</span>
							<div className="h-2 flex-1 bg-soft">
								<div
									className="h-2 bg-black"
									style={{
										width: `${total ? (counts[i] / total) * 100 : 0}%`,
									}}
								/>
							</div>
							<span className="w-4 text-right">{counts[i]}</span>
						</div>
					))}
				</div>

				<div className="text-center md:text-right">
					<button type="button" className="btn-primary">
						Write a review
					</button>
				</div>
			</div>

			<ul className="mt-12 divide-y divide-line">
				{reviews.map((r) => (
					<li key={r.id} className="py-6">
						<div className="flex items-center justify-between">
							<Stars count={r.rating} />
							<span className="text-[13px] text-black/60">{r.date}</span>
						</div>
						<p className="mt-2 flex items-center gap-2 text-[14px]">
							{r.name}
							{r.verified && (
								<span className="bg-black px-2 py-0.5 text-[11px] text-white">
									Verified
								</span>
							)}
						</p>
						{r.title && <p className="mt-3 font-semibold">{r.title}</p>}
						{r.body && <p className="mt-1 text-[14px]">{r.body}</p>}
					</li>
				))}
			</ul>

			<h2 className="mb-10 mt-20 text-center text-[24px] tracking-[0.2em]">
				LET CUSTOMERS SPEAK FOR US
			</h2>
			<div className="grid gap-10 text-center md:grid-cols-3">
				{featuredReviews.map((r) => (
					<div key={r.id} className="flex flex-col items-center gap-2">
						<Stars count={r.rating} />
						{r.title && <p className="font-semibold">{r.title}</p>}
						<p className="text-[14px]">{r.body}</p>
						<p className="mt-2 text-[13px] text-black/60">{r.name}</p>
					</div>
				))}
			</div>
		</section>
	);
}
