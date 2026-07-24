import { NextRequest, NextResponse } from "next/server";
import { getDb, orders, newOrderId } from "@/lib/db";
import { sendEmail, ownerEmail, ownerOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

type IncomingItem = {
	id: string;
	name: string;
	content?: string;
	qty: number;
	unit?: number;
	total?: number;
	listPrice?: number;
};

/** Create an order/enquiry from the website checkout. Public. */
export async function POST(req: NextRequest) {
	let body: Record<string, unknown>;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const name = str(body.name);
	const phone = str(body.phone);
	const address = str(body.address);
	const city = str(body.city);
	const state = str(body.state);
	const pincode = str(body.pincode);
	const items = Array.isArray(body.items) ? (body.items as IncomingItem[]) : [];

	if (!name || !phone || !address || !city || !state || !pincode) {
		return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
	}
	if (items.length === 0) {
		return NextResponse.json({ error: "No items" }, { status: 400 });
	}

	const itemCount = items.reduce((n, it) => n + (Number(it.qty) || 0), 0);
	const total = Number(body.total) || 0;
	const gst = Number(body.gst) || 0;
	const transport = Number(body.transport) || 0;
	const grandTotal = Number(body.grandTotal) || total + gst + transport;
	const hasPrices = body.hasPrices ? 1 : 0;

	// Order is created BEFORE payment with status "pending_payment" (visible in admin).
	const id = newOrderId(new Date().getFullYear());
	try {
		const db = getDb();
		await db.insert(orders).values({
			id,
			createdAt: Date.now(),
			status: "pending_payment",
			customerName: name,
			phone,
			whatsapp: str(body.whatsapp) || null,
			email: str(body.email) || null,
			gstNo: str(body.gstNo) || null,
			address,
			city,
			state,
			pincode,
			itemsJson: JSON.stringify(
				items.map((it) => ({
					id: it.id,
					name: it.name,
					content: it.content ?? "",
					qty: Number(it.qty) || 0,
					unit: Number(it.unit) || 0,
					total: Number(it.total) || 0,
				})),
			),
			itemCount,
			total,
			gst,
			transport,
			grandTotal,
			hasPrices,
			source: "website",
		});
	} catch (e) {
		console.error("order insert failed", e);
		return NextResponse.json({ error: "Could not save order" }, { status: 500 });
	}

	// Notify the owner by email (no-op until Resend is configured). Never fails the order.
	try {
		const { subject, text } = ownerOrderEmail(
			{ id, customerName: name, phone, city, state, itemCount, grandTotal, total, hasPrices },
			"new",
		);
		const custEmail = str(body.email);
		await sendEmail({ to: ownerEmail(), subject, text, replyTo: custEmail || undefined });
	} catch (e) {
		console.error("owner notify failed", e);
	}

	return NextResponse.json({ id });
}

function str(v: unknown): string {
	return typeof v === "string" ? v.trim() : "";
}
