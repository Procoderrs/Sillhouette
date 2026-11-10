import { Resend } from "resend";

function getClient() {
	const apiKey = process.env.RESEND_API_KEY;
	if (!apiKey) {
		throw new Error("RESEND_API_KEY is not set in .env.local");
	}
	return new Resend(apiKey);
}

export async function sendResetCodeEmail({ to, code }) {
	const resend = getClient();
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

	const { error } = await resend.emails.send({
		from: process.env.EMAIL_FROM ?? "Silhouette <onboarding@resend.dev>",
		to,
		subject: "Set or reset your Silhouette password",
		html: `
			<p>Your password code is <strong>${code}</strong>.</p>
			<p>Use this code to set your password (new account) or reset it (forgot password).</p>
			<p><a href="${siteUrl}/account/login?reset=1">Enter your code here</a></p>
			<p>This code expires in 10 minutes.</p>
			<p>If you did not request this, you can ignore this email.</p>
		`,
	});

	if (error) {
		throw new Error(`Email send failed: ${error.message}`);
	}
}
