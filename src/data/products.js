const colors = ["black", "red", "blue", "green", "ivory", "lavender"];
const styles = ["a-line", "anarkali", "straight", "kurta"];
const sizeSets = [
	["XS", "S", "M", "L", "XL"],
	["S", "M", "L"],
	["M", "L", "XL"],
];

const base = {
	salePrice: null,
	from: false,
	badge: null,
	images: ["/purple.webp", "/brown.webp"],
};

const make = (collection, prefix, n, extra = {}) =>
	Array.from({ length: n }, (_, i) => ({
		...base,
		id: `${collection}-${i + 1}`,
		name: `${prefix} ${i + 1}`,
		slug: `${collection}-${i + 1}`,
		price: 44900,
		collection,
		color: colors[i % colors.length],
		style: styles[i % styles.length],
		sizes: sizeSets[i % sizeSets.length],
		...extra,
	}));

export const products = [
	...make("maahi-ii-luxury-eid-pret", "Maahi II Kurta", 8),
	...make("silk-solids-26", "Silk Solid", 8, { from: true }),
	...make("raha-eid-pret", "Raha Eid Pret", 8),
	...make("best-sellers", "Best Seller", 8),
	...make("formal", "Formal", 8),
	...make("lumiere-luxury-formals26", "Lumiere Formal", 8),
	...make("husan-ara-bridal-25", "Husan Ara", 8),
	...make("anarkali-bridal-24", "Anarkali", 8),
	...make("noor-jahan-bridal-23", "Noor Jahan", 8),
	...make("roshanara-bridal-22", "Roshanara", 8),
	...make("Meeras - Formal Collection '25", "Meeras", 8),
	...make("zarqa", "Zarqa", 8),
	...make("rivaj", "Rivaj", 8),
	...make("rang-e-bahar", "Rang-e-Bahar", 8),
	...make("tosha-kinari", "Tosha Kinari", 8),
	...make("shawl-collection", "Shawl Collection", 8),
	...make("maahi-eid-pret", "Maahi II Luxury Eid Pret", 8),
	...make("silk-solids", "Silk Solids", 8),
	...make("maahi-luxury-pret-25", "Maahi Luxury Pret", 8),
	...make("luxe", "Luxe", 8),
	...make("opal", "Opal", 8),
	...make("riwaj-luxury-pret", "Riwaj Luxury Pret", 8),
	...make("raha-eid-pret-26", "Raha Eid Pret 26", 8),
	...make("engagement", "Engagement", 8),
	...make("mehndi", "Mehndi", 8),
	...make("nikkah", "Nikkah", 8),
	...make("barat", "Barat", 8),
	...make("walima", "Walima", 8),
	...make("pouches-clutches", "Pouch", 3),
];
