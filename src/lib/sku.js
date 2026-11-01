// "Unstitched" -> "UNSTITCHED", "XS" -> "XS"
export function codeOf(value) {
	return String(value)
		.toUpperCase()
		.replace(/[^A-Z0-9]+/g, "");
}

// Variant ka SKU: base SKU + sirf wo options jin ka useInSku on hai (jaise Size)
export function buildVariantSku(baseSku, options, attributes) {
	const parts = options
		.filter((o) => o.useInSku)
		.map((o) => {
			const attr = attributes.find((a) => a.name === o.name);
			return attr ? codeOf(attr.value) : "";
		})
		.filter(Boolean);

	return [baseSku.toUpperCase(), ...parts].join("-");
}
