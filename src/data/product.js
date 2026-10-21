const maahiII = (i) => ({
	id: `maahi-${i}`,
	name: `Maahi II Kurta ${i}`,
	slug: `maahi-ii-kurta-${i}`,
	price: 44900,
	salePrice: null,
	from: false,
	badge: i % 3 === 0 ? "New" : null,
	collection: "maahi-ii-luxury-eid-pret",
	images: [`/purple.webp`, `/brown.webp`],
});

export const products = Array.from({ length: 8 }, (_, i) => maahiII(i + 1));
