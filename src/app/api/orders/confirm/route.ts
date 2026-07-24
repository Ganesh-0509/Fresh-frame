import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, orders } from "@/lib/db";
import { sendEmail, ownerEmail, ownerOrderEmail } from "@/lib/email";

export const runtime = "nodejs";

/**
 * Customer confirms they've paid: attaches UTR + (optional) receipt screenshot.
 * Moves the order from pending_payment → pending_verification for admin approval.
 */
export async function POST(req: NextRequest) {
	let body: Record<string, unknown>;
	try {
		body = await req.json();
	} catch {
		return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
	}

	const id = typeof body.id === "string" ? body.id.trim() : "";
	const utr = typeof body.utr === "string" ? body.utr.trim() : "";
	const screenshot = typeof body.screenshot === "string" ? body.screenshot : "";

	if (!id) return NextResponse.json({ error: "Missing order id" }, { status: 400 });
	// Guard against oversized payloads (~1.6MB of base64).
	if (screenshot.length > 1_600_000) {
		return NextResponse.json({ error: "Screenshot too large" }, { status: 413 });
	}

	let row: typeof orders.$inferSelect | undefined;
	try {
		const db = getDb();
		const existing = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
		if (!existing[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });
		row = existing[0];

		await db
			.update(orders)
			.set({
				utr: utr || null,
				screenshotData: screenshot || null,
				status: "pending_verification",
			})
			.where(eq(orders.id, id));
	} catch (e) {
		console.error("order confirm failed", e);
		return NextResponse.json({ error: "Could not confirm order" }, { status: 500 });
	}

	// Tell the owner a payment is waiting to be verified (no-op until Resend is configured).
	try {
		if (row) {
			const { subject, text } = ownerOrderEmail(row, "payment");
			await sendEmail({
				to: ownerEmail(),
				subject,
				text: `${text}\n\nUTR: ${utr || "—"}`,
				replyTo: row.email || undefined,
			});
		}
	} catch (e) {
		console.error("owner notify failed", e);
	}

	return NextResponse.json({ ok: true });
}
