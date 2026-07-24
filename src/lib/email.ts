/**
 * Email helpers (Resend). Replaces the old Meta WhatsApp automation — every
 * automated/owner/customer notification now goes over email instead.
 *
 * Two modes (mirrors how WhatsApp used to work):
 *  - MAILTO LINK (always available): build a `mailto:` link the owner clicks to
 *    email a customer from their own mail client. Free, no setup.
 *  - RESEND API (auto-send): once RESEND_API_KEY + EMAIL_FROM are set,
 *    sendEmail() auto-notifies on new orders / status changes.
 *    Until then emailConfigured() is false and the UI falls back to the mailto link.
 *
 * Resend is a pure HTTPS API (fetch) — it runs unchanged on Cloudflare Workers,
 * unlike SMTP. `EMAIL_FROM` must be an address on a Resend-verified domain.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SITE } from "@/lib/site";
import { STATUS_LABEL, type OrderRow, type OrderStatus } from "@/lib/db";

function env() {
	return getCloudflareContext().env as unknown as {
		RESEND_API_KEY?: string;
		EMAIL_FROM?: string;
		OWNER_EMAIL?: string;
	};
}

/** Owner's inbox — where new-order / payment notifications land. */
export function ownerEmail(): string {
	return env().OWNER_EMAIL || SITE.email;
}

export function emailConfigured(): boolean {
	const e = env();
	return Boolean(e.RESEND_API_KEY && e.EMAIL_FROM);
}

/** A `mailto:` deep link (free, always works — the owner sends from their mail client). */
export function customerMailLink(to: string, subject: string, body: string): string {
	const q = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	return `mailto:${encodeURIComponent(to)}?${q}`;
}

/** Friendly, per-status update for a customer. */
export function statusEmail(order: OrderRow): { subject: string; text: string } {
	const name = order.customerName.split(" ")[0] || "there";
	const from = `— ${SITE.name}`;
	const s = order.status as OrderStatus;
	const subject = `${SITE.name} · Order ${order.id} — ${STATUS_LABEL[s]}`;
	let line: string;
	switch (s) {
		case "verified":
			line = `your payment for order ${order.id} is verified ✅. Your order is confirmed and we'll start preparing it.`;
			break;
		case "confirmed":
			line = `your order ${order.id} is confirmed 🎆. We'll update you as we pack and dispatch it.`;
			break;
		case "packing":
			line = `your order ${order.id} is being packed 📦.`;
			break;
		case "ready":
			line = `your order ${order.id} is packed and ready to dispatch.`;
			break;
		case "dispatched":
			line = `good news — order ${order.id} has been dispatched 🚚. Collect it from your nearest transport office; we'll share the details.`;
			break;
		case "delivered":
			line = `hope you received order ${order.id} safely. Have a safe and happy Deepavali! 🎆`;
			break;
		case "rejected":
			line = `we couldn't verify the payment for order ${order.id}. Please reply with your payment details and we'll help.`;
			break;
		case "cancelled":
			line = `your order ${order.id} has been cancelled. Reply if you have any questions.`;
			break;
		default:
			line = `we've received your order ${order.id}. Please complete the payment and share the receipt so we can confirm it.`;
	}
	return { subject, text: `Hi ${name}, ${line}\n\n${from}` };
}

/** Owner notification when a new order / payment comes in. */
export function ownerOrderEmail(
	order: Pick<OrderRow, "id" | "customerName" | "phone" | "city" | "state" | "itemCount" | "grandTotal" | "total" | "hasPrices">,
	kind: "new" | "payment",
): { subject: string; text: string } {
	const amount = order.hasPrices ? `₹${order.grandTotal || order.total}` : "TBC";
	const subject =
		kind === "payment"
			? `💰 Payment submitted — order ${order.id} (${order.customerName})`
			: `🆕 New order ${order.id} — ${order.customerName}`;
	const text =
		`${kind === "payment" ? "A customer submitted a payment to verify." : "A new order was placed."}\n\n` +
		`Order: ${order.id}\n` +
		`Customer: ${order.customerName} (${order.phone})\n` +
		`Location: ${order.city}, ${order.state}\n` +
		`Items: ${order.itemCount}\n` +
		`Amount: ${amount}\n\n` +
		`Open the admin panel to review it.`;
	return { subject, text };
}

/**
 * Send an email via the Resend HTTPS API. No-op (returns false) until
 * RESEND_API_KEY + EMAIL_FROM are configured. Pure fetch — runs on Cloudflare
 * Workers as-is. `EMAIL_FROM` must be on a Resend-verified domain.
 */
export async function sendEmail(opts: {
	to: string;
	subject: string;
	text: string;
	html?: string;
	replyTo?: string;
}): Promise<boolean> {
	const e = env();
	if (!e.RESEND_API_KEY || !e.EMAIL_FROM) return false;
	if (!opts.to) return false;
	try {
		const res = await fetch("https://api.resend.com/emails", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${e.RESEND_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				from: e.EMAIL_FROM,
				to: [opts.to],
				subject: opts.subject,
				text: opts.text,
				...(opts.html ? { html: opts.html } : {}),
				...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
			}),
		});
		if (!res.ok) {
			console.error("sendEmail: Resend returned", res.status, await res.text().catch(() => ""));
			return false;
		}
		return true;
	} catch (err) {
		console.error("sendEmail failed", err);
		return false;
	}
}

export { STATUS_LABEL };
