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
import { money } from "@/lib/site";
import { customerMailLink, statusEmail, emailConfigured, sendEmail, ownerEmail } from "@/lib/email";
import { StatusPill } from "@/components/StatusPill";

export const dynamic = "force-dynamic";

/** Auto-notify the customer by email for a status (no-op until Resend is configured). */
async function notify(orderId: string, status: OrderStatus) {
	const o = await getOrder(orderId);
	if (!o || !o.email || !emailConfigured()) return;
	const { subject, text } = statusEmail({ ...o, status });
	await sendEmail({ to: o.email, subject, text, replyTo: ownerEmail() });
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
			<Link href="/admin/orders" className="text-[15px] font-semibold text-brand hover:underline">
				← All orders
			</Link>

			<div className="mt-2 flex flex-wrap items-center justify-between gap-3">
				<h1 className="flex items-center gap-2 text-[26px] font-extrabold text-ink">
					{order.id} <StatusPill status={order.status} />
				</h1>
				<span className="text-[14px] text-muted">
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
								<p className="mb-1 text-[13px] text-muted">Receipt screenshot</p>
								{/* eslint-disable-next-line @next/next/no-img-element */}
								<a href={order.screenshotData} target="_blank" rel="noopener">
									<img src={order.screenshotData} alt="payment receipt" className="max-h-72 rounded-lg border border-line" />
								</a>
							</div>
						) : (
							<p className="mt-1 text-[14px] text-muted">No screenshot uploaded.</p>
						)}
					</Card>

					<Card title={`Items (${order.itemCount})`}>
						<div className="overflow-x-auto">
							<table className="w-full text-[14.5px]">
								<thead>
									<tr className="text-left text-muted">
										<th className="py-1.5">Product</th>
										<th className="py-1.5">Qty</th>
										<th className="py-1.5 text-right">Total</th>
									</tr>
								</thead>
								<tbody>
									{items.map((it) => (
										<tr key={it.id} className="border-t border-line">
											<td className="py-1.5 text-ink">
												{it.name}
												<span className="block text-[12.5px] text-muted">{it.content}</span>
											</td>
											<td className="py-1.5 text-ink">{it.qty}</td>
											<td className="py-1.5 text-right text-ink">{it.total ? money(it.total) : "—"}</td>
										</tr>
									))}
								</tbody>
								<tfoot>
									<tr className="border-t border-line">
										<td className="py-1 text-muted" colSpan={2}>Subtotal</td>
										<td className="py-1 text-right text-ink-soft">
											{order.hasPrices ? money(order.total) : "—"}
										</td>
									</tr>
									{order.gst > 0 && (
										<tr>
											<td className="py-1 text-muted" colSpan={2}>GST</td>
											<td className="py-1 text-right text-ink-soft">{money(order.gst)}</td>
										</tr>
									)}
									<tr>
										<td className="py-1 text-muted" colSpan={2}>Transport</td>
										<td className="py-1 text-right text-ink-soft">{money(order.transport)}</td>
									</tr>
									<tr className="border-t border-line font-bold">
										<td className="py-2 text-ink" colSpan={2}>
											Grand total {order.hasPrices ? "" : "(prices TBC)"}
										</td>
										<td className="py-2 text-right text-brand">
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
							<p className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13.5px] text-amber-800">
								Check the payment reference / screenshot against your bank, then approve or reject.
							</p>
						) : (
							<p className="mb-3 text-[14px] text-muted">Current: <StatusPill status={order.status} /></p>
						)}
						<div className="flex gap-2">
							<form action={setStatus} className="flex-1">
								<input type="hidden" name="status" value="verified" />
								<button className="w-full rounded-lg bg-emerald-600 px-3 py-2.5 text-[15px] font-semibold text-white hover:brightness-110">
									✓ Approve
								</button>
							</form>
							<form action={setStatus} className="flex-1">
								<input type="hidden" name="status" value="rejected" />
								<button className="w-full rounded-lg border border-red-300 px-3 py-2.5 text-[15px] font-semibold text-red-600 hover:bg-red-50">
									✕ Reject
								</button>
							</form>
						</div>
						<div className="mt-3 flex flex-wrap gap-2">
							{(["confirmed", "packing", "ready", "dispatched", "delivered"] as const).map((st) => (
								<form key={st} action={setStatus}>
									<input type="hidden" name="status" value={st} />
									<button className="rounded-lg border border-line bg-white px-3 py-2 text-[13.5px] font-semibold text-ink-soft hover:bg-row">
										{STATUS_LABEL[st]}
									</button>
								</form>
							))}
						</div>
					</Card>

					<Card title="Manage order">
						<form action={save} className="space-y-3">
							<label className="block text-[14px] font-semibold text-ink">
								Status
								<select
									name="status"
									defaultValue={order.status}
									className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand"
								>
									{ORDER_STATUSES.map((s) => (
										<option key={s} value={s}>
											{STATUS_LABEL[s]}
										</option>
									))}
								</select>
							</label>
							<label className="block text-[14px] font-semibold text-ink">
								Payment reference number
								<input
									name="paymentRef"
									defaultValue={order.paymentRef ?? ""}
									placeholder="The UTR / transaction number from the receipt"
									className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand"
								/>
							</label>
							<label className="block text-[14px] font-semibold text-ink">
								Private note (only you see this)
								<textarea
									name="adminNote"
									defaultValue={order.adminNote ?? ""}
									rows={3}
									className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink outline-none focus:border-brand"
								/>
							</label>
							<button className="w-full rounded-lg bg-brand px-4 py-3 text-[16px] font-bold text-white hover:brightness-110">
								Save
							</button>
						</form>
					</Card>

					<Card title="Email the customer">
						{order.email ? (
							<>
								<p className="mb-3 text-[14px] text-muted">
									Send a status update by email.
								</p>
								<a
									href={customerMailLink(
										order.email,
										statusEmail(order).subject,
										statusEmail(order).text,
									)}
									className="block rounded-lg bg-brand px-4 py-3 text-center text-[15px] font-bold text-white hover:brightness-110"
								>
									Open email with “{STATUS_LABEL[order.status as OrderStatus]}” message
								</a>
							</>
						) : (
							<p className="mb-1 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[13.5px] text-amber-800">
								This customer didn&apos;t give an email — call them on {order.phone}.
							</p>
						)}
						<p className="mt-3 text-[13px] text-muted">
							{emailConfigured()
								? "Emails are on — status changes send automatically."
								: `Automatic emails aren't switched on yet. Until then, use the button above to send one yourself.`}
						</p>
					</Card>
				</div>
			</div>
		</div>
	);
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
			<h2 className="mb-3 text-[15px] font-bold text-brand">{title}</h2>
			{children}
		</section>
	);
}

function Row({ k, v }: { k: string; v: string }) {
	return (
		<div className="flex gap-3 py-1 text-[15px]">
			<span className="w-24 shrink-0 text-muted">{k}</span>
			<span className="font-medium text-ink">{v}</span>
		</div>
	);
}
