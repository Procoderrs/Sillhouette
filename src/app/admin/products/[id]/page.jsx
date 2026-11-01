import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import { getProductById } from "@/services/productService";

export const metadata = { title: "Edit Product | Admin" };

export default async function EditProductPage({ params }) {
	const { id } = await params;

	let product;
	try {
		product = await getProductById(id);
	} catch {
		notFound();
	}

	// ObjectId aur Date client component mein direct nahi jate, isliye plain object banate hain
	const plain = JSON.parse(JSON.stringify(product));

	return <ProductForm product={plain} productId={id} />;
}
