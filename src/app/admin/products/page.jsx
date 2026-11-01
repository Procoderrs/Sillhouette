import Link from "next/link";
import ProductsTable from "@/components/admin/ProductsTable";

export const metadata = {
	title: "Products | Admin",
};

export default function AdminProductsPage() {
	return (
		<section className="space-y-8">
			<div className="flex items-center justify-between">
				<h1 className="text-[22px] uppercase tracking-[0.15em]">Products</h1>
				<Link
					href="/admin/products/new"
					className="border border-black px-4 py-2 text-[13px] uppercase tracking-[0.15em]"
				>
					New product
				</Link>
			</div>

			<ProductsTable />
		</section>
	);
}
