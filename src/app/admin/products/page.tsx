import { requireAdmin } from "@/lib/admin-auth";
import { getCatalog } from "@/lib/catalog";
import ProductEditor from "./ProductEditor";

export const dynamic = "force-dynamic";

export default async function AdminProducts() {
	await requireAdmin();
	const catalog = await getCatalog();

	return (
		<div>
			<h1 className="mb-1 text-2xl font-bold">Products ({catalog.products.length})</h1>
			<p className="mb-6 text-[13.5px] text-white/60">
				Edit prices, names, packs and availability. Changes go live on the website
				immediately. MRP = struck-through price; Price = what the customer pays.
			</p>
			<ProductEditor categories={catalog.categories} products={catalog.products} />
		</div>
	);
}
