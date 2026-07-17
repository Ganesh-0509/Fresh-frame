"use client";

import { useMemo, useState } from "react";
import { SITE, money, sellPrice, waLink } from "@/lib/site";
import { CATEGORIES, PRODUCTS } from "@/lib/catalogue";
import { CategoryIcon, WhatsAppIcon } from "@/components/icons";

type Qty = Record<string, number>;

export default function EstimateBuilder() {
	const [qty, setQty] = useState<Qty>({});
	const [tab, setTab] = useState<string>("all");

	const totals = useMemo(() => {
		let items = 0;
		let list = 0;
		let net = 0;
		for (const p of PRODUCTS) {
			const q = qty[p.id] ?? 0;
			if (!q) continue;
			items += q;
			list += p.listPrice * q;
			net += sellPrice(p.listPrice) * q;
		}
		return { items, list, net, save: list - net };
	}, [qty]);

	const message = useMemo(() => {
		const lines = PRODUCTS.filter((p) => (qty[p.id] ?? 0) > 0).map((p) => {
			const q = qty[p.id];
			return `• ${p.name} (${p.content}) × ${q} = ${money(sellPrice(p.listPrice) * q)}`;
		});
		if (!lines.length) {
			return `Hi ${SITE.name}, please send me this year's price list.`;
		}
		return (
			`Hi ${SITE.name}, I'd like an estimate for:\n\n` +
			lines.join("\n") +
			`\n\n*Total: ${money(totals.net)}*\n\n` +
			`Please confirm availability and transport. Thank you!`
		);
	}, [qty, totals.net]);

	/** Normalise the box so it can never disagree with the total. */
	function setValue(id: string, raw: string) {
		const trimmed = raw.trim();
		if (trimmed === "") {
			// Let them clear it and type — don't slam a 0 back in mid-edit.
			setQty((q) => ({ ...q, [id]: 0 }));
			return;
		}
		let n = Math.floor(Number(trimmed));
		if (!Number.isFinite(n) || n < 0) n = 0;
		setQty((q) => ({ ...q, [id]: n }));
	}

	const belowMin = totals.net > 0 && totals.net < SITE.minOrder;
	const shown = tab === "all" ? CATEGORIES : CATEGORIES.filter((c) => c.id === tab);

	return (
		<>
			{/* ---- sticky totals ---- */}
			<div className="sticky top-[44px] z-40 mb-4 border border-line bg-white shadow-sm">
				<div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3">
					<div className="flex flex-wrap gap-x-6 gap-y-2">
						<Stat label="Items" value={String(totals.items)} />
						<Stat label="List price" value={money(totals.list)} strike />
						<Stat label="Your price" value={money(totals.net)} accent />
						<Stat label="You save" value={money(totals.save)} green />
					</div>
					<div className="flex gap-2">
						<button
							onClick={() => setQty({})}
							className="border border-line px-3 py-2 text-[14px] font-medium text-ink-soft hover:bg-row"
						>
							Clear
						</button>
						<a
							href={waLink(message)}
							target="_blank"
							rel="noopener"
							className="inline-flex items-center gap-1.5 bg-[#25D366] px-4 py-2 text-[14px] font-semibold text-[#04331a] hover:brightness-95"
						>
							<WhatsAppIcon className="h-4 w-4" /> Send list on WhatsApp
						</a>
					</div>
				</div>
				{belowMin ? (
					<p className="border-t border-line bg-[#fff6f6] px-4 py-2 text-[14px] text-brand">
						⚠️ Minimum order is {money(SITE.minOrder)} — add{" "}
						{money(SITE.minOrder - totals.net)} more to send your list.
					</p>
				) : (
					<p className="border-t border-line bg-row px-4 py-2 text-[14px] text-muted">
						Minimum order {money(SITE.minOrder)}. Transport is quoted separately when we
						call you.
					</p>
				)}
			</div>

			{/* ---- category tabs ---- */}
			<div className="mb-6 flex gap-2 overflow-x-auto pb-2">
				{[{ id: "all", name: "All items", emoji: "" }, ...CATEGORIES].map((c) => (
					<button
						key={c.id}
						onClick={() => setTab(c.id)}
						className={`whitespace-nowrap border px-3 py-1.5 text-[14px] font-medium transition-colors ${
							tab === c.id
								? "border-brand bg-brand text-white"
								: "border-line bg-white text-ink-soft hover:bg-row"
						}`}
					>
						<span className="inline-flex items-center gap-1.5">
							<CategoryIcon id={c.id} className="h-4 w-4" />
							{c.name}
						</span>
					</button>
				))}
			</div>

			{/* ---- tables ---- */}
			{shown.map((c) => {
				const items = PRODUCTS.filter((p) => p.categoryId === c.id);
				if (!items.length) return null;
				return (
					<section key={c.id} id={c.id} className="mb-10 scroll-mt-28">
						<h3 className="mb-3 flex items-center gap-2 border-b-2 border-brand pb-2 text-lg font-semibold text-ink">
							<CategoryIcon id={c.id} className="h-5 w-5 text-brand" /> {c.name}
						</h3>
						<div className="overflow-x-auto border border-line">
							<table className="w-full min-w-[640px] border-collapse text-[15px]">
								<thead>
									<tr className="bg-shell text-left text-[13px] uppercase tracking-wide text-ink-soft">
										<th className="px-3 py-2.5 font-semibold">Product</th>
										<th className="px-3 py-2.5 font-semibold">List price</th>
										<th className="px-3 py-2.5 font-semibold">Your price</th>
										<th className="px-3 py-2.5 font-semibold">Qty</th>
										<th className="px-3 py-2.5 font-semibold">Total</th>
									</tr>
								</thead>
								<tbody>
									{items.map((p, i) => {
										const q = qty[p.id] ?? 0;
										const unit = sellPrice(p.listPrice);
										return (
											<tr
												key={p.id}
												className={i % 2 ? "bg-row-alt" : "bg-white"}
											>
												<td className="px-3 py-2.5">
													<div className="flex items-center gap-2.5">
														<span className="grid h-10 w-10 flex-none place-items-center rounded border border-line bg-gradient-to-br from-[#fff7e6] to-[#fdeccb]">
															<CategoryIcon id={c.id} className="h-6 w-6 text-brand" />
														</span>
														<span>
															<span className="block font-medium text-ink">
																{p.name}
																{p.isGreen && (
																	<span
																		title="NEERI-certified green cracker"
																		className="ml-1.5 rounded-sm bg-[#e8f7ec] px-1.5 py-0.5 text-[12px] font-semibold text-[#1a7f37]"
																	>
																		GREEN
																	</span>
																)}
															</span>
															<span className="block text-[13px] text-muted">
																{p.content}
															</span>
														</span>
													</div>
												</td>
												<td className="px-3 py-2.5 text-muted line-through">
													{money(p.listPrice)}
												</td>
												<td className="px-3 py-2.5 font-semibold text-brand">
													{money(unit)}
												</td>
												<td className="px-3 py-2.5">
													<input
														type="number"
														min={0}
														step={1}
														inputMode="numeric"
														aria-label={`Quantity for ${p.name}`}
														value={q === 0 ? "" : q}
														placeholder="0"
														onChange={(e) => setValue(p.id, e.target.value)}
														className="w-[70px] border border-line px-2 py-1.5 text-center font-medium focus:border-brand focus:outline-none"
													/>
												</td>
												<td
													className={`px-3 py-2.5 font-semibold ${
														q > 0 ? "text-ink" : "text-muted"
													}`}
												>
													{money(unit * q)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</section>
				);
			})}
		</>
	);
}

function Stat({
	label,
	value,
	strike,
	accent,
	green,
}: {
	label: string;
	value: string;
	strike?: boolean;
	accent?: boolean;
	green?: boolean;
}) {
	return (
		<div>
			<p className="text-[12px] font-semibold uppercase tracking-wider text-muted">
				{label}
			</p>
			<p
				className={`text-lg font-bold ${
					strike ? "text-muted line-through" : accent ? "text-brand" : green ? "text-[#1a7f37]" : "text-ink"
				}`}
			>
				{value}
			</p>
		</div>
	);
}
