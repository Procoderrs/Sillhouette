import nodemailer from "nodemailer";

let transporter = null;

function getTransporter() {
	if (!transporter) {
		const port = Number(process.env.SMTP_PORT || 587);
		transporter = nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port,
			secure: port === 465, // 465 SSL, 587 STARTTLS
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
		});
	}
	return transporter;
}

// Sab emails isi function se jayenge
export async function sendMail({ to, subject, html }) {
	if (!process.env.SMTP_HOST) throw new Error("SMTP_HOST is not set");

	const from = process.env.EMAIL_FROM || process.env.SMTP_USER;
	await getTransporter().sendMail({ from, to, subject, html });
}
