import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listOrders, statusCounts, STATUS_LABEL, PROCESSING_STATUSES } from "@/lib/db";
import { money } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
	await requireAdmin();
	const orders = await listOrders(300);
	const counts = statusCounts(orders);
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const todayMs = startOfToday.getTime();

	const today = orders.filter((o) => o.createdAt >= todayMs).length;
	const processing = PROCESSING_STATUSES.reduce((n, s) => n + (counts[s] ?? 0), 0);
	const cancelled = (counts.cancelled ?? 0) + (counts.rejected ?? 0);
	const revenue = orders
		.filter((o) => ["verified", ...PROCESSING_STATUSES, "delivered"].includes(o.status) && o.hasPrices)
		.reduce((s, o) => s + (o.grandTotal || o.total), 0);
	const recent = orders.slice(0, 6);

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
				<Tile label="Today's orders" value={String(today)} highlight />
				<Tile label="Pending payment" value={String(counts.pending_payment ?? 0)} />
				<Tile label="Pending verification" value={String(counts.pending_verification ?? 0)} />
				<Tile label="Verified" value={String(counts.verified ?? 0)} />
				<Tile label="Processing" value={String(processing)} />
				<Tile label="Delivered" value={String(counts.delivered ?? 0)} />
				<Tile label="Cancelled" value={String(cancelled)} />
			</div>

			<div className="mt-4 rounded border border-white/10 bg-white/5 p-4">
				<p className="text-[13px] text-white/60">Confirmed order value (verified onward)</p>
				<p className="text-2xl font-bold text-[#ffd54a]">{money(revenue)}</p>
			</div>

			<div className="mt-8 flex items-center justify-between">
				<h2 className="text-lg font-semibold">Recent orders</h2>
				<Link href="/admin/orders" className="text-[13.5px] text-[#ffd54a] hover:underline">
					View all →
				</Link>
			</div>

			{recent.length === 0 ? (
				<p className="mt-4 rounded border border-dashed border-white/15 p-8 text-center text-white/50">
					No orders yet. Submit a test order from the website checkout to see it here.
				</p>
			) : (
				<ul className="mt-3 divide-y divide-white/10 rounded border border-white/10 bg-white/5">
					{recent.map((o) => (
						<li key={o.id}>
							<Link
								href={`/admin/orders/${o.id}`}
								className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5"
							>
								<span>
									<span className="font-semibold">{o.id}</span>{" "}
									<span className="text-white/70">· {o.customerName}</span>
									<span className="block text-[12.5px] text-white/45">
										{o.city}, {o.state} · {o.itemCount} items
									</span>
								</span>
								<span className="text-right">
									<StatusPill status={o.status} />
									<span className="mt-1 block text-[13px] text-white/70">
										{o.hasPrices ? money(o.total) : "—"}
									</span>
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

function Tile({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
	return (
		<div
			className={`rounded border p-3 ${
				highlight ? "border-brand/40 bg-brand/15" : "border-white/10 bg-white/5"
			}`}
		>
			<p className="text-[11.5px] uppercase tracking-wide text-white/50">{label}</p>
			<p className="text-xl font-bold">{value}</p>
		</div>
	);
}

export function StatusPill({ status }: { status: string }) {
	const map: Record<string, string> = {
		pending_payment: "bg-amber-400/20 text-amber-300",
		pending_verification: "bg-orange-400/20 text-orange-300",
		verified: "bg-sky-400/20 text-sky-300",
		confirmed: "bg-blue-400/20 text-blue-300",
		packing: "bg-indigo-400/20 text-indigo-300",
		ready: "bg-violet-400/20 text-violet-300",
		dispatched: "bg-fuchsia-400/20 text-fuchsia-300",
		delivered: "bg-emerald-400/20 text-emerald-300",
		cancelled: "bg-red-400/20 text-red-300",
		rejected: "bg-red-500/25 text-red-300",
	};
	return (
		<span
			className={`inline-block rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
				map[status] ?? "bg-white/10 text-white/70"
			}`}
		>
			{STATUS_LABEL[status as keyof typeof STATUS_LABEL] ?? status}
		</span>
	);
}
