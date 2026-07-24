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
			<div className="mb-4 flex flex-wrap gap-2">
				{LINES.map((l) => (
					<button
						key={l.id}
						onClick={() => {
							setLine(l.id);
							setCatId("all");
						}}
						className={`rounded-lg px-4 py-2.5 text-[15px] font-semibold ${
							line === l.id ? "bg-brand text-white shadow-sm" : "border border-line bg-white text-ink-soft hover:bg-row"
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
					className="rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] text-ink"
				>
					<option value="all">
						All categories ({products.filter((p) => p.line === line).length})
					</option>
					{cats.map((c) => (
						<option key={c.id} value={c.id}>
							{c.name} ({products.filter((p) => p.categoryId === c.id).length})
						</option>
					))}
				</select>
				<button
					onClick={() => setMgmt((v) => !v)}
					className="ml-auto rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-row"
				>
					{mgmt ? "Close categories" : "Manage categories"}
				</button>
				<button
					onClick={() => setAdding((v) => !v)}
					className="rounded-lg border border-line bg-white px-3 py-2.5 text-[15px] font-semibold text-ink hover:bg-row"
				>
					{adding ? "Close" : "+ Add product"}
				</button>
			</div>

			{/* category management */}
			{mgmt && (
				<div className="mb-5 rounded-xl border border-line bg-row p-4">
					<h3 className="mb-2 text-[15px] font-bold text-ink">
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
										<button className="rounded-lg bg-brand px-3 py-2 text-[14px] font-semibold text-white hover:brightness-110">
											Rename
										</button>
									</form>
									<span className="text-[13px] text-muted">{count} products</span>
									<form action={deleteCategoryAction}>
										<input type="hidden" name="id" value={c.id} />
										<button
											disabled={count > 0}
											title={count > 0 ? "Empty the category first" : "Delete category"}
											className="rounded-lg border border-red-300 px-2.5 py-2 text-[14px] font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
										>
											Delete
										</button>
									</form>
								</div>
							);
						})}
					</div>
					<form action={createCategoryAction} className="mt-3 flex items-center gap-2 border-t border-line pt-3">
						<input type="hidden" name="line" value={line} />
						<input name="name" required placeholder="New category name" className={cell} />
						<button className="rounded-lg bg-emerald-600 px-3 py-2 text-[14px] font-semibold text-white hover:brightness-110">
							+ Add category
						</button>
					</form>
				</div>
			)}

			{/* add form */}
			{adding && (
				<form
					action={createProductAction}
					className="mb-5 grid gap-2 rounded-xl border border-emerald-300 bg-emerald-50 p-4 sm:grid-cols-[1fr_140px_90px_90px_auto]"
				>
					<input type="hidden" name="line" value={line} />
					<input
						name="name"
						required
						placeholder="Product name"
						className={cell}
					/>
					<input name="content" placeholder="Pack (e.g. 10 PCS · 1 Box)" className={cell} />
					<input name="mrp" type="number" min={0} placeholder="Old price" className={cell} />
					<input name="price" type="number" min={0} placeholder="Your price" className={cell} />
					<div className="flex items-center gap-2">
						<select name="categoryId" required className={cell}>
							{cats.map((c) => (
								<option key={c.id} value={c.id}>
									{c.name}
								</option>
							))}
						</select>
						<button className="rounded-lg bg-emerald-600 px-3 py-2.5 text-[14px] font-semibold text-white hover:brightness-110">
							Add
						</button>
					</div>
				</form>
			)}

			{/* editable rows */}
			<div className="space-y-2">
				<div className="hidden grid-cols-[1fr_130px_84px_84px_64px_84px_120px] gap-2 px-1 text-[12px] font-semibold uppercase tracking-wide text-muted sm:grid">
					<span>Product name</span>
					<span>Pack</span>
					<span>Old price ₹</span>
					<span>Your price ₹</span>
					<span>Show</span>
					<span>Stock</span>
					<span></span>
				</div>
				{shown.map((p) => (
					<form
						key={p.id}
						action={saveProductAction}
						className="grid items-center gap-2 rounded-xl border border-line bg-white p-2.5 shadow-sm sm:grid-cols-[1fr_130px_84px_84px_64px_84px_120px]"
					>
						<input type="hidden" name="id" value={p.id} />
						<input name="name" defaultValue={p.name} className={cell} />
						<input name="content" defaultValue={p.content} className={cell} />
						<input name="mrp" type="number" min={0} defaultValue={p.mrp} className={cell} />
						<input name="price" type="number" min={0} defaultValue={p.price} className={cell} />
						<label className="flex items-center gap-1.5 text-[14px] text-ink-soft">
							<input type="checkbox" name="active" defaultChecked={p.active} className="h-4 w-4 accent-[var(--color-brand)]" /> On
						</label>
						<input
							name="stock"
							type="number"
							defaultValue={p.stock}
							title="-1 = always available, 0 = sold out"
							className={cell}
						/>
						<div className="flex gap-1.5">
							<button className="flex-1 rounded-lg bg-brand px-2 py-2 text-[14px] font-semibold text-white hover:brightness-110">
								Save
							</button>
							<button
								formAction={deleteProductAction}
								className="rounded-lg border border-red-300 px-2.5 py-2 text-[14px] font-semibold text-red-600 hover:bg-red-50"
								title="Delete"
							>
								✕
							</button>
						</div>
					</form>
				))}
				{shown.length === 0 && (
					<p className="rounded-xl border border-dashed border-line bg-white p-6 text-center text-[15px] text-muted">
						No products in this filter.
					</p>
				)}
			</div>
			<p className="mt-3 text-[13px] text-muted">
				Tip: <b className="text-ink-soft">Stock</b> — leave it as <b>−1</b> for &ldquo;always available&rdquo;, or set <b>0</b> to show &ldquo;Sold out&rdquo;.
			</p>
		</div>
	);
}

const cell =
	"w-full rounded-lg border border-line bg-white px-3 py-2 text-[15px] text-ink outline-none focus:border-brand";
