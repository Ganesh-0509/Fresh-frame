import type { Metadata } from "next";
import EstimateBuilder from "@/components/EstimateBuilder";
import { money } from "@/lib/site";
import { getCatalog, getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Price List",
	description:
		"Full Deepavali 2026 cracker price list. Build your list and send it on WhatsApp for a same-day estimate. Enquiry only — no online sale.",
};

export default async function ProductsPage() {
	const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);

	return (
		<>
			<section className="border-b border-line bg-shell py-8">
				<div className="mx-auto max-w-[1170px] px-4">
					<h1 className="text-2xl font-bold text-ink sm:text-3xl">List of Products</h1>
					<p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-soft">
						Set the quantity against anything you want. Your total updates as you go —
						then tap <strong>Proceed to Checkout</strong> to fill your details and get
						payment info. Prefer to ask first? Use <strong>Ask on WhatsApp</strong>.
					</p>
				</div>
			</section>

			<section className="py-8">
				<div className="mx-auto max-w-[1170px] px-4">
					<div className="mb-6 border-l-4 border-brand bg-row p-4 text-[14.5px] leading-6 text-ink-soft">
						<strong className="text-ink">
							⚖️ Important note: this is an enquiry list, not a shopping cart.
						</strong>{" "}
						No payment is taken on this website. We confirm stock and the final amount
						with you by phone first; payment is arranged offline afterwards, as required
						for firecracker sales in India. Minimum order {money(settings.minOrder)}.
					</div>

					<EstimateBuilder
						categories={catalog.categories}
						products={catalog.products}
						settings={settings}
					/>
				</div>
			</section>
		</>
	);
}
