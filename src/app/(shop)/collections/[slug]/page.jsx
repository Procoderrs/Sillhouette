import { notFound } from "next/navigation";
import CollectionView from "@/components/collection/CollectionView";
import { getCollectionPage } from "@/services/collectionService";

const SALE_NOTE = "Sales items will not be return, exchange or refunded.";

export default async function CollectionPage({ params }) {
	const { slug } = await params;

	const page = await getCollectionPage(slug);
	if (!page) notFound();

	// ObjectId aur Date client component mein direct nahi jate
	const { collection, products } = JSON.parse(JSON.stringify(page));

	return (
		<CollectionView
			title={collection.name}
			note={collection.isSale ? SALE_NOTE : null}
			saleView={collection.isSale}
			products={products}
		/>
	);
}
