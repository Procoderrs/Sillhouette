import { formatPrice } from "@/lib/utils";
import { sendMail } from "@/lib/mailer";

// Existing account ko order attach hone par
export async function sendOrderLinkedEmail({ to, firstName, orderNumber }) {
	const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

	await sendMail({
		to,
		subject: `Order ${orderNumber} added to your account`,
		html: `
			<p>Hi ${firstName},</p>
			<p>A new order (<strong>${orderNumber}</strong>) was placed using your email address.</p>
			<p><a href="${siteUrl}/account/login">Log in to view your orders</a></p>
			<p>If this was not you, please contact us.</p>
		`,
	});
}

// Payment complete hone par confirmation
export async function sendOrderConfirmationEmail({
	to,
	name,
	orderNumber,
	items,
	total,
	orderUrl,
}) {
	const rows = items
		.map(
			(i) => `
			<tr>
				<td style="padding:6px 8px;border-bottom:1px solid #eee;">${i.name}${i.variant ? ` (${i.variant})` : ""}</td>
				<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center;">${i.qty}</td>
				<td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;">${formatPrice(i.price * i.qty)}</td>
			</tr>`,
		)
		.join("");

	await sendMail({
		to,
		subject: `Order ${orderNumber} confirmed`,
		html: `
			<p>Hi ${name},</p>
			<p>Thank you for your order. Your payment has been received.</p>
			<p><strong>Order number:</strong> ${orderNumber}</p>
			<table style="width:100%;border-collapse:collapse;font-size:14px;">
				<thead>
					<tr>
						<th style="text-align:left;padding:6px 8px;border-bottom:2px solid #000;">Item</th>
						<th style="text-align:center;padding:6px 8px;border-bottom:2px solid #000;">Qty</th>
						<th style="text-align:right;padding:6px 8px;border-bottom:2px solid #000;">Price</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
				<tfoot>
					<tr>
						<td colspan="2" style="padding:8px;text-align:right;font-weight:bold;">Total</td>
						<td style="padding:8px;text-align:right;font-weight:bold;">${formatPrice(total)}</td>
					</tr>
				</tfoot>
			</table>
			<p><a href="${orderUrl}">View your order</a></p>
			<p>If you have any questions, please contact us.</p>
		`,
	});
}
