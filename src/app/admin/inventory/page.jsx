import { getInventory } from "@/services/inventoryService";
import InventoryRefresh from "@/components/admin/InventoryRefresh";

// Har request par fresh data aaye, cache na ho
export const dynamic = "force-dynamic";

const LOW_STOCK = 5;

function stockState(stock) {
	if (stock === 0) return { text: "Out of stock", cls: "text-red-700" };
	if (stock <= LOW_STOCK) return { text: "Low stock", cls: "text-amber-700" };
	return { text: "In stock", cls: "text-green-700" };
}

export default async function AdminInventoryPage() {
	const products = await getInventory();
	const totalVariants = products.reduce((n, p) => n + p.variants.length, 0);

	return (
		<div className="space-y-6">
			<InventoryRefresh seconds={30} />

			<div>
				<h1 className="text-[24px] uppercase tracking-[0.15em]">Inventory</h1>
				<p className="text-[13px] text-neutral-500">
					{products.length} products, {totalVariants} variants. Refreshes every
					30 seconds.
				</p>
			</div>

			{products.length === 0 ? (
				<p className="text-[14px] text-neutral-500">No products found.</p>
			) : (
				<div className="overflow-x-auto border border-neutral-200 bg-white">
					<table className="w-full text-left text-[14px]">
						<thead className="bg-neutral-50 text-[12px] uppercase tracking-[0.1em] text-neutral-500">
							<tr>
								<th className="px-4 py-3">Product</th>
								<th className="px-4 py-3">Variant</th>
								<th className="px-4 py-3">SKU</th>
								<th className="px-4 py-3 text-right">In stock</th>
								<th className="px-4 py-3 text-right">Reserved</th>
								<th className="px-4 py-3 text-right">Sold</th>
								<th className="px-4 py-3">Status</th>
							</tr>
						</thead>
						<tbody>
							{products.flatMap((p) =>
								p.variants.map((v) => {
									const state = stockState(v.stock);
									return (
										<tr
											key={`${p._id}-${v.sku}`}
											className="border-t border-neutral-200"
										>
											<td className="px-4 py-3">
												{p.name}
												{!p.isActive && (
													<span className="ml-2 text-[12px] text-neutral-500">
														(inactive)
													</span>
												)}
											</td>
											<td className="px-4 py-3">{v.label}</td>
											<td className="px-4 py-3 font-mono text-[12px]">
												{v.sku}
											</td>
											<td className="px-4 py-3 text-right font-semibold">
												{v.stock}
											</td>
											<td className="px-4 py-3 text-right">{v.reserved}</td>
											<td className="px-4 py-3 text-right">{v.sold}</td>
											<td className={`px-4 py-3 ${state.cls}`}>{state.text}</td>
										</tr>
									);
								}),
							)}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
