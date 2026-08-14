/**
 * Tax invoice as a PDF, generated with pdf-lib (pure JS — no native deps, so it
 * runs fine on Cloudflare Workers). Mirrors the fields shown on the printable
 * /admin/orders/[id]/invoice page. Called from api/orders/route.ts right after
 * an order is created, so it can be attached to the customer's confirmation email.
 */

import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { SITE, type Settings } from "@/lib/site";
import { STATUS_LABEL, type OrderRow, type OrderItem, type OrderStatus } from "@/lib/db";

const PAGE_W = 595.28; // A4 in points
const PAGE_H = 841.89;
const MARGIN = 42;
const INK = rgb(0.09, 0.09, 0.09);
const MUTED = rgb(0.45, 0.45, 0.45);
const LINE = rgb(0.82, 0.82, 0.82);

// pdf-lib's standard fonts only support WinAnsi (cp1252) glyphs. Every string
// below comes either from the owner's editable Settings or from a customer's
// form input (name/address/…) — either could contain a ₹ sign, an emoji, or a
// non-Latin script, none of which cp1252 can encode. Drawing an unencodable
// character throws and would silently kill the invoice attachment (and used
// to happen on every order that qualified for a spend-tier discount, since
// those labels are written with "₹" — see lib/site.ts SITE.discountTiers).
// Everything drawn on the page is routed through this first.
const WINANSI_SAFE = /[^\x20-\x7E -ÿ–—‘’“”…•]/g;
function safeText(s: string): string {
	return s.replace(/₹/g, "Rs ").replace(WINANSI_SAFE, "?");
}

const moneyPdf = (n: number) => "Rs " + Number(n).toLocaleString("en-IN");

type InvoiceOrder = Pick<
	OrderRow,
	| "id"
	| "createdAt"
	| "status"
	| "customerName"
	| "phone"
	| "address"
	| "city"
	| "state"
	| "area"
	| "pincode"
	| "email"
	| "gstNo"
	| "total"
	| "gst"
	| "transport"
	| "grandTotal"
	| "hasPrices"
	| "tierDiscount"
	| "tierLabel"
	| "couponCode"
	| "couponDiscount"
	| "paymentRef"
	| "utr"
>;

/** Sanitizes, draws one line of text, and returns the y just below it. */
function line(
	page: PDFPage,
	text: string,
	x: number,
	y: number,
	font: PDFFont,
	size: number,
	color = INK,
	maxWidth?: number,
): number {
	page.drawText(safeText(text), { x, y, size, font, color, ...(maxWidth ? { maxWidth } : {}) });
	return y - size - 4;
}

/** x position that right-aligns `text` (after sanitizing) against `rightEdge`. */
function rightAlign(font: PDFFont, size: number, text: string, rightEdge: number): number {
	return rightEdge - font.widthOfTextAtSize(safeText(text), size);
}

export async function buildInvoicePdf(order: InvoiceOrder, items: OrderItem[], settings: Settings): Promise<Uint8Array> {
	const doc = await PDFDocument.create();
	const regular = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);

	let page = doc.addPage([PAGE_W, PAGE_H]);
	let y = PAGE_H - MARGIN;
	const left = MARGIN;
	const right = PAGE_W - MARGIN;

	const date = new Date(order.createdAt).toLocaleDateString("en-IN", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
	const isTax = Boolean(settings.gstNumber);

	// ---- header: shop details (left) + invoice meta (right) ----
	const headerTop = y;
	y = line(page, SITE.name, left, y, bold, 18);
	y = line(page, settings.legalName, left, y, regular, 10, MUTED);
	y = line(page, settings.addressLine, left, y, regular, 10, MUTED);
	y = line(
		page,
		`${settings.phone}${settings.email ? "  ·  " + settings.email : ""}`,
		left,
		y,
		regular,
		10,
		MUTED,
	);
	if (settings.gstNumber) y = line(page, `GSTIN: ${settings.gstNumber}`, left, y, regular, 10, MUTED);
	if (settings.licence) y = line(page, `Explosives licence: ${settings.licence}`, left, y, regular, 10, MUTED);
	const leftBottom = y;

	let ry = headerTop;
	const title = isTax ? "TAX INVOICE" : "INVOICE";
	ry = line(page, title, rightAlign(bold, 16, title, right), ry, bold, 16);
	const metaLines = [
		`Invoice no. ${order.id}`,
		`Date: ${date}`,
		`Status: ${STATUS_LABEL[order.status as OrderStatus]}`,
	];
	for (const m of metaLines) ry = line(page, m, rightAlign(regular, 10, m, right), ry, regular, 10, MUTED);

	y = Math.min(leftBottom, ry) - 10;
	page.drawLine({ start: { x: left, y }, end: { x: right, y }, thickness: 1.2, color: INK });
	y -= 20;

	// ---- bill to ----
	y = line(page, "BILL TO", left, y, bold, 9, MUTED);
	y = line(page, order.customerName, left, y, bold, 12);
	y = line(page, order.phone, left, y, regular, 10, MUTED);
	y = line(page, order.address, left, y, regular, 10, MUTED);
	y = line(
		page,
		`${order.area ? order.area + ", " : ""}${order.city}, ${order.state} ${order.pincode}`,
		left,
		y,
		regular,
		10,
		MUTED,
	);
	if (order.email) y = line(page, order.email, left, y, regular, 10, MUTED);
	if (order.gstNo) y = line(page, `GSTIN: ${order.gstNo}`, left, y, regular, 10, MUTED);
	y -= 12;

	// ---- items table ----
	const col = { n: left, item: left + 24, qty: right - 190, rate: right - 120, amt: right - 10 };
	const drawTableHeader = () => {
		page.drawLine({ start: { x: left, y: y + 12 }, end: { x: right, y: y + 12 }, thickness: 1, color: INK });
		line(page, "#", col.n, y, bold, 9, INK);
		line(page, "Item", col.item, y, bold, 9, INK);
		const qh = "Qty", rh = "Rate", ah = "Amount";
		line(page, qh, rightAlign(bold, 9, qh, col.rate - 10), y, bold, 9, INK);
		line(page, rh, rightAlign(bold, 9, rh, col.amt - 60), y, bold, 9, INK);
		line(page, ah, rightAlign(bold, 9, ah, col.amt), y, bold, 9, INK);
		y -= 16;
		page.drawLine({ start: { x: left, y: y + 8 }, end: { x: right, y: y + 8 }, thickness: 1, color: INK });
	};
	drawTableHeader();

	items.forEach((it, i) => {
		if (y < MARGIN + 140) {
			page = doc.addPage([PAGE_W, PAGE_H]);
			y = PAGE_H - MARGIN;
			drawTableHeader();
		}
		line(page, String(i + 1), col.n, y, regular, 10, INK);
		line(page, it.name, col.item, y, regular, 10, INK, col.qty - col.item - 10);
		const qtyS = String(it.qty);
		const rateS = it.unit ? moneyPdf(it.unit) : "—";
		const amtS = it.total ? moneyPdf(it.total) : "—";
		line(page, qtyS, rightAlign(regular, 10, qtyS, col.rate - 10), y, regular, 10, INK);
		line(page, rateS, rightAlign(regular, 10, rateS, col.amt - 60), y, regular, 10, INK);
		line(page, amtS, rightAlign(regular, 10, amtS, col.amt), y, regular, 10, INK);
		y -= 14;
		if (it.content) {
			line(page, it.content, col.item, y, regular, 8, MUTED, col.qty - col.item - 10);
			y -= 12;
		}
		page.drawLine({ start: { x: left, y: y + 6 }, end: { x: right, y: y + 6 }, thickness: 0.5, color: LINE });
		y -= 4;
	});

	if (y < MARGIN + 140) {
		page = doc.addPage([PAGE_W, PAGE_H]);
		y = PAGE_H - MARGIN;
	}

	// ---- totals ----
	y -= 10;
	const totalsRow = (label: string, value: string, opts?: { bold?: boolean; color?: ReturnType<typeof rgb> }) => {
		const f = opts?.bold ? bold : regular;
		const c = opts?.color ?? MUTED;
		line(page, label, col.rate - 130, y, f, 10.5, c);
		line(page, value, rightAlign(f, 10.5, value, col.amt), y, f, 10.5, INK);
		y -= 16;
	};
	totalsRow("Subtotal", order.hasPrices ? moneyPdf(order.total) : "TBC");
	if (order.tierDiscount > 0) {
		totalsRow(
			`Spend offer${order.tierLabel ? ` (${order.tierLabel})` : ""}`,
			`-${moneyPdf(order.tierDiscount)}`,
			{ color: rgb(0.06, 0.45, 0.32) },
		);
	}
	if (order.couponCode) {
		totalsRow(`Discount code ${order.couponCode}`, `-${moneyPdf(order.couponDiscount)}`, {
			color: rgb(0.06, 0.45, 0.32),
		});
	}
	if (order.gst > 0) totalsRow("GST", moneyPdf(order.gst));
	totalsRow("Transport", moneyPdf(order.transport));
	y -= 2;
	page.drawLine({ start: { x: col.rate - 130, y: y + 12 }, end: { x: right, y: y + 12 }, thickness: 1.2, color: INK });
	totalsRow(
		"Grand total",
		order.hasPrices ? moneyPdf(order.grandTotal || order.total + order.transport) : "TBC",
		{ bold: true },
	);

	// ---- payment + footer ----
	y -= 18;
	page.drawLine({ start: { x: left, y: y + 10 }, end: { x: right, y: y + 10 }, thickness: 0.75, color: LINE });
	y -= 6;
	y = line(page, "PAYMENT", left, y, bold, 9, MUTED);
	y = line(page, `UTR / reference: ${order.paymentRef || order.utr || "—"}`, left, y, regular, 10, MUTED);
	if (settings.upi) y = line(page, `UPI: ${settings.upi}`, left, y, regular, 10, MUTED);
	if (settings.bankAccount) {
		y = line(
			page,
			`${settings.bankHolder} · ${settings.bankName} · A/c ${settings.bankAccount} · IFSC ${settings.bankIfsc}`,
			left,
			y,
			regular,
			10,
			MUTED,
		);
	}
	y -= 10;
	line(page, "This is a computer-generated invoice.", left, y, regular, 9, MUTED);
	line(page, `Thank you for your order — ${SITE.name}.`, left, y - 14, bold, 9.5, INK);

	return doc.save();
}
