import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
// Keep the same import path you used before for LogoutButton
import LogoutButton from "@/components/account/LogoutButton";

function InfoRow({ label, value }) {
	return (
		<div className="flex flex-col gap-1 border-b border-line py-4 md:flex-row md:justify-between">
			<span className="text-[12px] uppercase tracking-[0.2em] text-neutral-500">
				{label}
			</span>
			<span className="text-[15px]">{value || "-"}</span>
		</div>
	);
}

export default async function AccountPage() {
	const user = await getCurrentUser();
	if (!user) redirect("/account/login");

	return (
		<section className="site-container py-16">
			<div className="mx-auto max-w-2xl space-y-10">
				<div>
					<p className="text-[12px] uppercase tracking-[0.25em] text-neutral-500">
						Account
					</p>
					<h1 className="mt-2 text-[28px] uppercase tracking-[0.15em]">
						My account
					</h1>
				</div>

				<div>
					<InfoRow label="First name" value={user.firstName} />
					<InfoRow label="Last name" value={user.lastName} />
					<InfoRow label="Email" value={user.email} />
					<InfoRow label="Role" value={user.role} />
				</div>

				<div className="flex flex-col gap-4">
					<Link href="/account/orders" className="btn-primary text-center">
						My orders
					</Link>
					<LogoutButton />
				</div>
			</div>
		</section>
	);
}
