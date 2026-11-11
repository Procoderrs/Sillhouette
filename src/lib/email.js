import { sendMail } from "@/lib/mailer";

export async function sendResetCodeEmail({ to, code }) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

	await sendMail({
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
}
