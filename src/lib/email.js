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

	const { error } = await resend.emails.send({
		from: process.env.EMAIL_FROM ?? "Silhouette <onboarding@resend.dev>",
		to,
		subject: "Your Silhouette password reset code",
		html: `
			<p>Your password reset code is <strong>${code}</strong>.</p>
			<p>This code expires in 10 minutes.</p>
			<p>If you did not request this, you can ignore this email.</p>
		`,
	});

	if (error) {
		throw new Error(`Email send failed: ${error.message}`);
	}
}
