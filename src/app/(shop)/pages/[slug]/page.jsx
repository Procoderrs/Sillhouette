import { notFound } from "next/navigation";
import { pages } from "@/data/pages";

export function generateStaticParams() {
	return Object.keys(pages).map((slug) => ({ slug }));
}

function renderBlock(block, i) {
	if (typeof block === "string") {
		return (
			<p key={i} className="mb-4">
				{block}
			</p>
		);
	}

	if (block.heading) {
		return (
			<h2
				key={i}
				className="mb-3 mt-8 text-[15px] font-semibold uppercase tracking-[0.1em]"
			>
				{block.heading}
			</h2>
		);
	}

	if (block.list) {
		return (
			<ul key={i} className="mb-4 list-disc space-y-2 pl-5">
				{block.list.map((item, j) => (
					<li key={j}>{item}</li>
				))}
			</ul>
		);
	}

	return null;
}

export default async function StaticPage({ params }) {
	const { slug } = await params;
	const page = pages[slug];

	if (!page) notFound();

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-3xl">
				<h1 className="mb-12 text-center text-[28px] uppercase tracking-[0.2em]">
					{page.title}
				</h1>

				<div className="text-[15px] leading-relaxed">
					{page.content.map(renderBlock)}
				</div>
			</div>
		</section>
	);
}
