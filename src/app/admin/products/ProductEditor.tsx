"use client";

import { useMemo, useState } from "react";
import { LINES, type CatCategory, type CatProduct, type LineId } from "@/lib/catalog-types";
import {
	saveProductAction,
	deleteProductAction,
	createProductAction,
	createCategoryAction,
	renameCategoryAction,
	deleteCategoryAction,
} from "./actions";

export default function ProductEditor({
	categories,
	products,
}: {
	categories: CatCategory[];
	products: CatProduct[];
}) {
	const [line, setLine] = useState<LineId>("standard");
	const [catId, setCatId] = useState<string>("all");
	const [adding, setAdding] = useState(false);
	const [mgmt, setMgmt] = useState(false);

	const cats = useMemo(() => categories.filter((c) => c.line === line), [categories, line]);
	const shown = useMemo(
		() =>
			products.filter(
				(p) => p.line === line && (catId === "all" || p.categoryId === catId),
			),
		[products, line, catId],
	);

	return (
		<div>
			{/* line toggle */}
			<div className="mb-4 flex gap-2">
				{LINES.map((l) => (
					<button
						key={l.id}
						onClick={() => {
							setLine(l.id);
							setCatId("all");
						}}
						className={`rounded px-4 py-2 text-[14px] font-semibold ${
							line === l.id ? "bg-brand text-white" : "bg-white/10 text-white/70 hover:bg-white/20"
						}`}
					>
						{l.name} <span className="opacity-60">({l.sub})</span>
					</button>
				))}
			</div>

			{/* category filter + add */}
			<div className="mb-4 flex flex-wrap items-center gap-2">
				<select
					value={catId}
					onChange={(e) => setCatId(e.target.value)}
					className="rounded border border-white/20 bg-white/5 px-3 py-2 text-[14px] text-white"
				>
					<option value="all" className="bg-[#0e1428]">
						All categories ({products.filter((p) => p.line === line).length})
					</option>
					{cats.map((c) => (
						<option key={c.id} value={c.id} className="bg-[#0e1428]">
							{c.name} ({products.filter((p) => p.categoryId === c.id).length})
						</option>
					))}
				</select>
				<button
					onClick={() => setMgmt((v) => !v)}
					className="ml-auto rounded border border-white/25 px-3 py-2 text-[14px] font-semibold text-white hover:bg-white/10"
				>
					{mgmt ? "Close categories" : "Manage categories"}
				</button>
				<button
					onClick={() => setAdding((v) => !v)}
					className="rounded border border-white/25 px-3 py-2 text-[14px] font-semibold text-white hover:bg-white/10"
				>
					{adding ? "Close" : "+ Add product"}
				</button>
			</div>

			{/* category management */}
			{mgmt && (
				<div className="mb-5 rounded border border-sky-400/30 bg-sky-400/5 p-3">
					<h3 className="mb-2 text-[14px] font-semibold text-sky-200">
						{LINES.find((l) => l.id === line)?.name} categories
					</h3>
					<div className="space-y-2">
						{cats.map((c) => {
							const count = products.filter((p) => p.categoryId === c.id).length;
							return (
								<div key={c.id} className="flex flex-wrap items-center gap-2">
									<form action={renameCategoryAction} className="flex flex-1 items-center gap-2">
										<input type="hidden" name="id" value={c.id} />
										<input name="name" defaultValue={c.name} className={cell} />
										<button className="rounded bg-brand px-3 py-1.5 text-[13px] font-semibold text-white hover:brightness-110">
											Rename
										</button>
									</form>
									<span className="text-[12px] text-white/40">{count} products</span>
									<form action={deleteCategoryAction}>
										<input type="hidden" name="id" value={c.id} />
										<button
											disabled={count > 0}
											title={count > 0 ? "Empty the category first" : "Delete category"}
											className="rounded border border-red-400/40 px-2 py-1.5 text-[13px] text-red-300 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-30"
										>
											Delete
										</button>
									</form>
								</div>
							);
						})}
					</div>
					<form action={createCategoryAction} className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3">
						<input type="hidden" name="line" value={line} />
						<input name="name" required placeholder="New category name" className={cell} />
						<button className="rounded bg-emerald-500 px-3 py-1.5 text-[13px] font-semibold text-black">
							+ Add category
						</button>
					</form>
				</div>
			)}

			{/* add form */}
			{adding && (
				<form
					action={createProductAction}
					className="mb-5 grid gap-2 rounded border border-emerald-400/30 bg-emerald-400/5 p-3 sm:grid-cols-[1fr_140px_90px_90px_auto]"
				>
					<input type="hidden" name="line" value={line} />
					<input
						name="name"
						required
						placeholder="Product name"
						className={cell}
					/>
					<input name="content" placeholder="Pack (e.g. 10 PCS · 1 Box)" className={cell} />
					<input name="mrp" type="number" min={0} placeholder="MRP" className={cell} />
					<input name="price" type="number" min={0} placeholder="Price" className={cell} />
					<div className="flex items-center gap-2">
						<select name="categoryId" required className={cell}>
							{cats.map((c) => (
								<option key={c.id} value={c.id} className="bg-[#0e1428]">
									{c.name}
								</option>
							))}
						</select>
						<button className="rounded bg-emerald-500 px-3 py-2 text-[13px] font-semibold text-black">
							Add
						</button>
					</div>
				</form>
			)}

			{/* editable rows */}
			<div className="space-y-2">
				<div className="hidden grid-cols-[1fr_130px_78px_78px_60px_84px_120px] gap-2 px-1 text-[11px] uppercase tracking-wide text-white/40 sm:grid">
					<span>Name</span>
					<span>Pack</span>
					<span>MRP</span>
					<span>Price</span>
					<span>Active</span>
					<span>Stock</span>
					<span></span>
				</div>
				{shown.map((p) => (
					<form
						key={p.id}
						action={saveProductAction}
						className="grid items-center gap-2 rounded border border-white/10 bg-white/5 p-2 sm:grid-cols-[1fr_130px_78px_78px_60px_84px_120px]"
					>
						<input type="hidden" name="id" value={p.id} />
						<input name="name" defaultValue={p.name} className={cell} />
						<input name="content" defaultValue={p.content} className={cell} />
						<input name="mrp" type="number" min={0} defaultValue={p.mrp} className={cell} />
						<input name="price" type="number" min={0} defaultValue={p.price} className={cell} />
						<label className="flex items-center gap-1.5 text-[13px] text-white/70">
							<input type="checkbox" name="active" defaultChecked={p.active} /> On
						</label>
						<input
							name="stock"
							type="number"
							defaultValue={p.stock}
							title="-1 = unlimited, 0 = out of stock"
							className={cell}
						/>
						<div className="flex gap-1.5">
							<button className="flex-1 rounded bg-brand px-2 py-1.5 text-[13px] font-semibold text-white hover:brightness-110">
								Save
							</button>
							<button
								formAction={deleteProductAction}
								className="rounded border border-red-400/40 px-2 py-1.5 text-[13px] text-red-300 hover:bg-red-400/10"
								title="Delete"
							>
								✕
							</button>
						</div>
					</form>
				))}
				{shown.length === 0 && (
					<p className="rounded border border-dashed border-white/15 p-6 text-center text-white/50">
						No products in this filter.
					</p>
				)}
			</div>
		</div>
	);
}

const cell =
	"w-full rounded border border-white/15 bg-white/5 px-2 py-1.5 text-[14px] text-white outline-none focus:border-brand";
