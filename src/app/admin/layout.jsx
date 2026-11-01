import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import LogoutButton from "@/components/account/LogoutButton";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({ children }) {
	const user = await getCurrentUser();

	if (!user) {
		redirect("/account/login?next=/admin");
	}

	if (user.role !== "admin") {
		redirect("/account");
	}

	return (
		<div className="min-h-screen">
			<header className="flex items-center justify-between border-b border-line px-6 py-4">
				<span className="text-[15px] uppercase tracking-[0.2em]">
					Admin Panel
				</span>
				<div className="flex items-center gap-4">
					<span className="text-[14px]">
						{user.firstName} {user.lastName} ({user.role})
					</span>
					<div className="w-32">
						<LogoutButton />
					</div>
				</div>
			</header>

			<div className="flex flex-col md:flex-row">
				<AdminSidebar />
				<main className="flex-1 p-6">{children}</main>
			</div>
		</div>
	);
}
