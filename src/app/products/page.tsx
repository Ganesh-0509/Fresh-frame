import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
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
			<PageHeader
				title="Price List"
				subtitle={`Set a quantity — your total updates live. Minimum order ${money(settings.minOrder)}.`}
			/>

			<section className="py-8">
				{/* Full-width table — expands to the viewport edges (minus padding). */}
				<div className="mx-auto w-full px-3 sm:px-5 lg:px-8">
					<div className="mb-4 rounded-md border border-line bg-row px-4 py-2.5 text-center text-[13.5px] text-muted">
						<strong className="text-ink">Note:</strong> rates are being finalised for
						Deepavali 2026. Any item shown as <strong className="text-brand">“—”</strong> —
						build your list and send it on WhatsApp for today&apos;s best price.
					</div>

					<EstimateBuilder
						categories={catalog.categories}
						products={catalog.products}
						settings={settings}
					/>

					{/* one small honest line — enquiry only, no cart (kept minimal on purpose) */}
					<p className="mt-8 text-center text-[14px] text-muted">
						Enquiry list, not a shopping cart — no online payment. We confirm stock &
						the final amount by phone.
					</p>
				</div>
			</section>
		</>
	);
}
