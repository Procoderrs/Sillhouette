import SettingsForm from "@/components/admin/SettingsForm";
import { getSettings } from "@/services/settingService";

export const metadata = {
	title: "Settings | Admin",
};

export default async function AdminSettingsPage() {
	const settings = JSON.parse(JSON.stringify(await getSettings()));

	return <SettingsForm settings={settings} />;
}
