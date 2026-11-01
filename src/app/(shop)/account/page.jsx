import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/account/LogoutButton";
export const metadata = {
	title: "My Account | Silhouette",
};

export default async function AccountPage() {
	const user = await getCurrentUser();

	// Middleware bhi ye kaam karta hai, ye second check hai
	if (!user) {
		redirect("/account/login");
	}

	return (
		<section className="site-container py-16">
			<h1 className="text-center text-[28px] tracking-[0.2em]">MY ACCOUNT</h1>

			<div className="mx-auto mt-12 max-w-md space-y-4 border border-line p-6 text-[15px]">
				<InfoRow label="First name" value={user.firstName} />
				<InfoRow label="Last name" value={user.lastName} />
				<InfoRow label="Email" value={user.email} />
				<InfoRow label="Role" value={user.role} />
			</div>
			<div className="mx-auto mt-8 max-w-md">
				<LogoutButton />
			</div>
		</section>
	);
}

function InfoRow({ label, value }) {
	return (
		<div className="flex items-center justify-between gap-4">
			<span className="text-[13px] uppercase tracking-[0.15em]">{label}</span>
			<span>{value}</span>
		</div>
	);
}
