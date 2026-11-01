import CollectionsManager from "@/components/admin/CollectionsManager";

export const metadata = { title: "Collections | Admin" };

export default function AdminCollectionsPage() {
	return (
		<div className="max-w-4xl space-y-8">
			<div>
				<p className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
					Admin
				</p>
				<h1 className="mt-1 text-[24px] uppercase tracking-[0.15em]">
					Collections
				</h1>
			</div>
			<CollectionsManager />
		</div>
	);
}
