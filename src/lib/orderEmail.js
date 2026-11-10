import { Resend } from "resend";

export async function sendOrderLinkedEmail({ to, firstName, orderNumber }) {
	const resend = new Resend(process.env.RESEND_API_KEY);
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

	const { error } = await resend.emails.send({
		from: process.env.EMAIL_FROM || "Silhouette <onboarding@resend.dev>",
		to,
		subject: `Order ${orderNumber} added to your account`,
		html: `
			<p>Hi ${firstName},</p>
			<p>A new order (<strong>${orderNumber}</strong>) was placed using your email address.</p>
			<p><a href="${siteUrl}/account/login">Log in to view your orders</a></p>
			<p>If this was not you, please contact us.</p>
		`,
	});

	// Resend returns errors instead of throwing, so throw here for the caller to log
	if (error) throw new Error(error.message);
}
