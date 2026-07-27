import { NextRequest, NextResponse } from "next/server";
import { getDb, orders, newOrderId } from "@/lib/db";
import { sendEmail, ownerEmail, ownerOrderEmail } from "@/lib/email";
import { cleanMapUrl, gstAmount, bestTier, tierDiscount } from "@/lib/site";
import { getSettings } from "@/lib/catalog";
import { checkCoupon } from "@/lib/coupons";
import { refusalMessage } from "@/lib/coupon-types";

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
	// 3rd delivery level + the map pin of that point (both optional — a city may
	// have no areas listed). The link is re-cleaned server-side so a crafted
	// request can't store a javascript:/data: href we'd later render.
	const area = str(body.area);
	const areaMap = cleanMapUrl(str(body.areaMap));
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
	const transport = Number(body.transport) || 0;
	const hasPrices = body.hasPrices ? 1 : 0;

	const settings = await getSettings().catch(() => null);

	// ---- spend-more-save-more slab: recomputed HERE from the owner's live
	// settings, never trusted from the browser. It is advertised on the home hero,
	// so it must be granted automatically whether or not the page asked for it.
	const tier = settings ? bestTier(total, settings.discountTiers) : null;
	const tierOff = settings ? tierDiscount(total, settings.discountTiers) : 0;

	// ---- coupon: judged HERE, never trusted from the browser ----
	// The client sends only the code; the discount, the GST on top of it and the
	// grand total are all recomputed server-side, so editing the page can't buy
	// anything. A refused code fails the order with a reason rather than silently
	// charging full price.
	const couponCode = str(body.coupon).toUpperCase();
	let couponDiscount = 0;
	if (couponCode) {
		try {
			const res = await checkCoupon(couponCode, { subtotal: total, phone });
			if (!res.ok) {
				return NextResponse.json(
					{ error: "Coupon rejected", couponError: refusalMessage(res.reason, res.minOrder) },
					{ status: 409 },
				);
			}
			couponDiscount = res.discount;
		} catch (e) {
			console.error("coupon check failed", e);
			return NextResponse.json(
				{ error: "Coupon check failed", couponError: "Could not check that code. Please try again." },
				{ status: 503 },
			);
		}
	}

	const taxable = Math.max(0, total - tierOff - couponDiscount);
	const gst = settings ? gstAmount(taxable, settings.gstPct) : Number(body.gst) || 0;
	const grandTotal = taxable + gst + transport;

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
			area: area || null,
			areaMap: areaMap || null,
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
			couponCode: couponCode || null,
			couponDiscount,
			tierDiscount: tierOff,
			tierLabel: tier?.label ?? null,
			source: "website",
		});
	} catch (e) {
		console.error("order insert failed", e);
		return NextResponse.json({ error: "Could not save order" }, { status: 500 });
	}

	// Notify the owner by email (no-op until Resend is configured). Never fails the order.
	try {
		const { subject, text } = ownerOrderEmail(
			{
				id,
				customerName: name,
				phone,
				city,
				state,
				area: area || null,
				areaMap: areaMap || null,
				tierDiscount: tierOff,
				tierLabel: tier?.label ?? null,
				couponCode: couponCode || null,
				couponDiscount,
				itemCount,
				grandTotal,
				total,
				hasPrices,
			},
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
