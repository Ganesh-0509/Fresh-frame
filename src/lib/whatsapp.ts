/**
 * WhatsApp helpers.
 *
 * Two modes:
 *  - DEEP LINK (always available): build a wa.me link the owner clicks to message
 *    a customer. Free, no setup.
 *  - META CLOUD API (auto-send): once the client's WHATSAPP_TOKEN + PHONE_NUMBER_ID
 *    are set, sendWhatsAppText() can auto-notify customers on status changes.
 *    Until then waConfigured() is false and the UI falls back to the deep link.
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SITE } from "@/lib/site";
import { STATUS_LABEL, type OrderRow } from "@/lib/db";

function env() {
	return getCloudflareContext().env as unknown as {
		WHATSAPP_TOKEN?: string;
		WHATSAPP_PHONE_NUMBER_ID?: string;
	};
}

export function waConfigured(): boolean {
	const e = env();
	return Boolean(e.WHATSAPP_TOKEN && e.WHATSAPP_PHONE_NUMBER_ID);
}

/** Normalise an Indian number to `91XXXXXXXXXX` (digits only). */
export function normalizePhone(raw: string): string {
	let d = (raw || "").replace(/\D/g, "");
	if (d.length === 10) d = "91" + d;
	if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
	return d;
}

export function customerWaLink(number: string, message: string): string {
	return `https://wa.me/${normalizePhone(number)}?text=${encodeURIComponent(message)}`;
}

/** Friendly, template-style status update for a customer. */
export function statusMessage(order: OrderRow): string {
	const name = order.customerName.split(" ")[0] || "there";
	const s = order.status;
	const from = `— ${SITE.name}`;
	switch (s) {
		case "verified":
			return `Hi ${name}, your payment for order ${order.id} is verified ✅. Your order is confirmed and we'll start preparing it. ${from}`;
		case "confirmed":
			return `Hi ${name}, your order ${order.id} is confirmed 🎆. We'll update you as we pack and dispatch it. ${from}`;
		case "packing":
			return `Hi ${name}, your order ${order.id} is being packed 📦. ${from}`;
		case "ready":
			return `Hi ${name}, your order ${order.id} is packed and ready to dispatch. ${from}`;
		case "dispatched":
			return `Hi ${name}, good news — order ${order.id} has been dispatched 🚚. Collect it from your nearest transport office; we'll share the details. ${from}`;
		case "delivered":
			return `Hi ${name}, hope you received order ${order.id} safely. Have a safe and happy Deepavali! 🎆 ${from}`;
		case "rejected":
			return `Hi ${name}, we couldn't verify the payment for order ${order.id}. Please reply here with your payment details and we'll help. ${from}`;
		case "cancelled":
			return `Hi ${name}, your order ${order.id} has been cancelled. Reply here if you have any questions. ${from}`;
		default:
			return `Hi ${name}, we've received your order ${order.id}. Please complete the payment and share the receipt so we can confirm it. ${from}`;
	}
}

/**
 * Send a plain text message via Meta Cloud API. No-op (returns false) until
 * the client's tokens are configured. Session-message text only works inside the
 * 24h customer-service window; outside it, Meta requires an approved template.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
	const e = env();
	if (!e.WHATSAPP_TOKEN || !e.WHATSAPP_PHONE_NUMBER_ID) return false;
	try {
		const res = await fetch(
			`https://graph.facebook.com/v21.0/${e.WHATSAPP_PHONE_NUMBER_ID}/messages`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${e.WHATSAPP_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					messaging_product: "whatsapp",
					to: normalizePhone(to),
					type: "text",
					text: { body },
				}),
			},
		);
		return res.ok;
	} catch {
		return false;
	}
}

export { STATUS_LABEL };
