const colors = [
	"Green",
	"Patasa",
	"Red",
	"Maysoo",
	"Blue",
	"Ivory",
	"Pink",
	"Black",
];
const styles = ["a-line", "anarkali", "straight", "lehenga"];
const sizeSets = [
	["XS", "S", "M"],
	["S", "M", "L", "XL"],
	["M", "L", "XL"],
];
const salePrices = [35000, 37500, 39900, 42000];

export const saleProducts = Array.from({ length: 62 }, (_, i) => {
	const color = colors[i % colors.length];
	return {
		id: `sale-${i + 1}`,
		name: `${color} (SHG${(i % 3) + 1})`,
		slug: `sale-item-${i + 1}`,
		price: 75000,
		salePrice: salePrices[i % salePrices.length],
		from: i % 5 === 0,
		badge: "sale",
		collection: "sale-1",
		color: color.toLowerCase(),
		style: styles[i % styles.length],
		sizes: sizeSets[i % sizeSets.length],
		images: [`/sale-1.webp`, `/sale-2.webp`],
	};
});
