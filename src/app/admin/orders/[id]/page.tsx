import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import {
	getOrder,
	updateOrder,
	parseItems,
	ORDER_STATUSES,
	STATUS_LABEL,
	type OrderStatus,
} from "@/lib/db";
import { money, SITE } from "@/lib/site";
import { customerWaLink, statusMessage, waConfigured, sendWhatsAppText } from "@/lib/whatsapp";
import { StatusPill } from "@/app/admin/page";

export const dynamic = "force-dynamic";

/** Auto-notify the customer on WhatsApp for a status (no-op until Meta is configured). */
async function notify(orderId: string, status: OrderStatus) {
	const o = await getOrder(orderId);
	if (o && waConfigured()) await sendWhatsAppText(o.whatsapp || o.phone, statusMessage({ ...o, status }));
}

export default async function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
	await requireAdmin();
	const { id } = await params;
	const order = await getOrder(id);
	if (!order) notFound();

	const items = parseItems(order.itemsJson);

	async function save(formData: FormData) {
		"use server";
		const status = String(formData.get("status") || "pending_payment") as OrderStatus;
		await updateOrder(id, {
			status,
			paymentRef: String(formData.get("paymentRef") || "") || null,
			adminNote: String(formData.get("adminNote") || "") || null,
		});
		await notify(id, status);
		redirect(`/admin/orders/${id}`);
	}

	async function setStatus(formData: FormData) {
		"use server";
		const status = String(formData.get("status") || "") as OrderStatus;
		if (status) {
			await updateOrder(id, { status });
			await notify(id, status);
		}
		redirect(`/admin/orders/${id}`);
	}

	return (
		<div>
			<Link href="/admin/orders" className="text-[13.5px] text-white/60 hover:underline">
				← All orders
			</Link>

			<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
				<h1 className="text-2xl font-bold">
					{order.id} <StatusPill status={order.status} />
				</h1>
				<span className="text-[13px] text-white/50">
					{new Date(order.createdAt).toLocaleString("en-IN")}
				</span>
			</div>

			<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
				{/* left: customer + items */}
				<div className="space-y-6">
					<Card title="Customer">
						<Row k="Name" v={order.customerName} />
						<Row k="Phone" v={order.phone} />
						<Row k="WhatsApp" v={order.whatsapp || order.phone} />
						{order.email && <Row k="Email" v={order.email} />}
						{order.gstNo && <Row k="GST no." v={order.gstNo} />}
						<Row k="Address" v={order.address} />
						<Row k="City / State" v={`${order.city}, ${order.state}`} />
						<Row k="Pincode" v={order.pincode} />
					</Card>

					<Card title="Payment">
						<Row k="UTR / Txn ID" v={order.utr || "—"} />
						{order.screenshotData ? (
							<div className="mt-2">
								<p className="mb-1 text-[12px] text-white/50">Receipt screenshot</p>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<a href={order.screenshotData} target="_blank" rel="noopener">
									<img src={order.screenshotData} alt="payment receipt" className="max-h-72 rounded border border-white/15" />
								</a>
							</div>
						) : (
							<p className="mt-1 text-[13px] text-white/40">No screenshot uploaded.</p>
						)}
					</Card>

					<Card title={`Items (${order.itemCount})`}>
						<div className="overflow-x-auto">
							<table className="w-full text-[13.5px]">
								<thead>
									<tr className="text-left text-white/50">
										<th className="py-1.5">Product</th>
										<th className="py-1.5">Qty</th>
										<th className="py-1.5 text-right">Total</th>
									</tr>
								</thead>
								<tbody>
									{items.map((it) => (
										<tr key={it.id} className="border-t border-white/10">
											<td className="py-1.5">
												{it.name}
												<span className="block text-[12px] text-white/40">{it.content}</span>
											</td>
											<td className="py-1.5">{it.qty}</td>
											<td className="py-1.5 text-right">{it.total ? money(it.total) : "—"}</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="border-t border-white/15">
										<td className="py-1 text-white/60" colSpan={2}>Subtotal</td>
										<td className="py-1 text-right text-white/80">
											{order.hasPrices ? money(order.total) : "—"}
										</td>
									</tr>
									{order.gst > 0 && (
										<tr>
											<td className="py-1 text-white/60" colSpan={2}>GST</td>
											<td className="py-1 text-right text-white/80">{money(order.gst)}</td>
										</tr>
									)}
									<tr>
										<td className="py-1 text-white/60" colSpan={2}>Transport</td>
										<td className="py-1 text-right text-white/80">{money(order.transport)}</td>
									</tr>
									<tr className="border-t border-white/15 font-semibold">
										<td className="py-2" colSpan={2}>
											Grand total {order.hasPrices ? "" : "(prices TBC)"}
										</td>
										<td className="py-2 text-right text-[#ffd54a]">
											{order.hasPrices ? money(order.grandTotal || order.total + order.transport) : "—"}
										</td>
									</tr>
								</tfoot>
							</table>
						</div>
					</Card>
				</div>

				{/* right: manage + message */}
				<div className="space-y-6">
					<Card title="Verify payment">
						{order.status === "pending_verification" ? (
							<p className="mb-3 text-[13px] text-amber-300">
								Check the UTR/screenshot against your bank, then approve or reject.
							</p>
						) : (
							<p className="mb-3 text-[13px] text-white/50">Current: <StatusPill status={order.status} /></p>
						)}
						<div className="flex gap-2">
							<form action={setStatus} className="flex-1">
								<input type="hidden" name="status" value="verified" />
								<button className="w-full rounded bg-emerald-500 px-3 py-2 text-[14px] font-semibold text-black hover:brightness-110">
									✓ Approve
								</button>
							</form>
							<form action={setStatus} className="flex-1">
								<input type="hidden" name="status" value="rejected" />
								<button className="w-full rounded border border-red-400/50 px-3 py-2 text-[14px] font-semibold text-red-300 hover:bg-red-400/10">
									✕ Reject
								</button>
							</form>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							{(["confirmed", "packing", "ready", "dispatched", "delivered"] as const).map((st) => (
								<form key={st} action={setStatus}>
									<input type="hidden" name="status" value={st} />
									<button className="rounded border border-white/20 px-2.5 py-1.5 text-[12.5px] text-white/80 hover:bg-white/10">
										{STATUS_LABEL[st]}
									</button>
								</form>
							))}
						</div>
					</Card>

					<Card title="Manage order">
						<form action={save} className="space-y-3">
							<label className="block text-[13px] text-white/70">
								Status
								<select
									name="status"
									defaultValue={order.status}
									className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
								>
									{ORDER_STATUSES.map((s) => (
										<option key={s} value={s} className="bg-[#0e1428]">
											{STATUS_LABEL[s]}
										</option>
									))}
								</select>
							</label>
							<label className="block text-[13px] text-white/70">
								Payment reference / UTR
								<input
									name="paymentRef"
									defaultValue={order.paymentRef ?? ""}
									placeholder="e.g. UPI txn id from the receipt"
									className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
								/>
							</label>
							<label className="block text-[13px] text-white/70">
								Internal note
								<textarea
									name="adminNote"
									defaultValue={order.adminNote ?? ""}
									rows={3}
									className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
								/>
							</label>
							<button className="w-full rounded bg-brand px-4 py-2.5 font-semibold text-white hover:brightness-110">
								Save
							</button>
						</form>
					</Card>

					<Card title="Message the customer">
						<p className="mb-3 text-[13px] text-white/60">
							Send a status update on WhatsApp.
						</p>
						<a
							href={customerWaLink(order.whatsapp || order.phone, statusMessage(order))}
							target="_blank"
							rel="noopener"
							className="block rounded bg-[#25D366] px-4 py-2.5 text-center font-semibold text-[#04331a] hover:brightness-95"
						>
							Open WhatsApp with “{STATUS_LABEL[order.status as OrderStatus]}” message
						</a>
						<p className="mt-3 text-[12px] text-white/45">
							{waConfigured()
								? "Meta automation is connected — status changes can auto-send."
								: `Automated sending (auto-reply on each status) turns on once ${SITE.name}'s Meta WhatsApp API tokens are added in Settings. Until then, use the button above.`}
						</p>
					</Card>
				</div>
			</div>
		</div>
	);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded border border-white/10 bg-white/5 p-4">
			<h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-white/50">
				{title}
			</h2>
			{children}
		</section>
	);
}

function Row({ k, v }: { k: string; v: string }) {
	return (
		<div className="flex gap-3 py-1 text-[14px]">
			<span className="w-24 shrink-0 text-white/50">{k}</span>
			<span className="text-white/90">{v}</span>
		</div>
	);
}
