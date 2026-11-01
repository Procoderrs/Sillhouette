import { notFound } from "next/navigation";
import CollectionView from "@/components/collection/CollectionView";
import { getCollectionPage } from "@/services/collectionService";

export default async function ChildCollectionPage({ params }) {
	const { slug, child } = await params;

	const page = await getCollectionPage(slug, child);
	if (!page) notFound();

	const { collection, products } = JSON.parse(JSON.stringify(page));

	return (
		<CollectionView
			title={collection.name}
			note={null}
			saleView={false}
			products={products}
		/>
	);
}
