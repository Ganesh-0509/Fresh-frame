import Link from "next/link";
import { requireAdmin } from "@/lib/admin-auth";
import { listOrders } from "@/lib/db";
import { money } from "@/lib/site";
import { StatusPill } from "@/app/admin/page";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
	await requireAdmin();
	const orders = await listOrders(300);

	return (
		<div>
			<h1 className="mb-6 text-2xl font-bold">Orders ({orders.length})</h1>

			{orders.length === 0 ? (
				<p className="rounded border border-dashed border-white/15 p-8 text-center text-white/50">
					No orders yet.
				</p>
			) : (
				<div className="overflow-x-auto rounded border border-white/10">
					<table className="w-full min-w-[720px] border-collapse text-[14px]">
						<thead>
							<tr className="bg-white/5 text-left text-[12px] uppercase tracking-wide text-white/50">
								<th className="px-3 py-2.5">Order</th>
								<th className="px-3 py-2.5">Customer</th>
								<th className="px-3 py-2.5">Location</th>
								<th className="px-3 py-2.5">Items</th>
								<th className="px-3 py-2.5">Total</th>
								<th className="px-3 py-2.5">Status</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((o) => (
								<tr key={o.id} className="border-t border-white/10 hover:bg-white/5">
									<td className="px-3 py-2.5">
										<Link href={`/admin/orders/${o.id}`} className="font-semibold text-[#ffd54a] hover:underline">
											{o.id}
										</Link>
										<span className="block text-[12px] text-white/40">
											{new Date(o.createdAt).toLocaleString("en-IN")}
										</span>
									</td>
									<td className="px-3 py-2.5">
										{o.customerName}
										<span className="block text-[12px] text-white/50">{o.phone}</span>
									</td>
									<td className="px-3 py-2.5 text-white/80">
										{o.city}, {o.state}
										<span className="block text-[12px] text-white/40">{o.pincode}</span>
									</td>
									<td className="px-3 py-2.5">{o.itemCount}</td>
									<td className="px-3 py-2.5">{o.hasPrices ? money(o.total) : "—"}</td>
									<td className="px-3 py-2.5">
										<StatusPill status={o.status} />
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}
