// Text format:
// Heading:            <- line jo ":" par khatam ho, wo heading banegi
// - item              <- "-" se shuru hone wali lines list banengi
// Khali line se sections alag honge
function parseBlocks(text = "") {
	return text
		.split(/\n\s*\n/)
		.map((block) => block.trim())
		.filter(Boolean)
		.map((block) => {
			const lines = block
				.split("\n")
				.map((l) => l.trim())
				.filter(Boolean);

			let heading = null;
			if (lines[0].endsWith(":")) {
				heading = lines.shift().slice(0, -1);
			}

			const isList = lines.length > 0 && lines.every((l) => /^[-•·]/.test(l));

			return { heading, lines, isList };
		});
}

export default function ProductDetails({ text }) {
	const blocks = parseBlocks(text);
	if (blocks.length === 0) return null;

	return (
		<div className="space-y-6 text-[14px] leading-relaxed">
			{blocks.map((b, i) => (
				<div key={i} className="space-y-2">
					{b.heading && (
						<h3 className="normal-case tracking-normal text-[15px] font-semibold">
							{b.heading}
						</h3>
					)}

					{b.isList ? (
						<ul className="list-disc space-y-1 pl-5">
							{b.lines.map((line, j) => (
								<li key={j}>{line.replace(/^[-•·]\s*/, "")}</li>
							))}
						</ul>
					) : (
						b.lines.map((line, j) => <p key={j}>{line}</p>)
					)}
				</div>
			))}
		</div>
	);
}
