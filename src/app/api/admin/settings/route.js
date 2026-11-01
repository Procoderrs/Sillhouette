import {
	adminGetSettings,
	adminUpdateSettings,
} from "@/controllers/adminSettingController";

export const GET = adminGetSettings;
export const PATCH = adminUpdateSettings;
