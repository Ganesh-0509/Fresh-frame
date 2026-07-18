import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getDb, orders } from "@/lib/db";

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

	try {
		const db = getDb();
		const existing = await db
			.select({ id: orders.id, status: orders.status })
			.from(orders)
			.where(eq(orders.id, id))
			.limit(1);
		if (!existing[0]) return NextResponse.json({ error: "Order not found" }, { status: 404 });

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

	return NextResponse.json({ ok: true });
}
