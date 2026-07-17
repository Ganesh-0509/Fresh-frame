import type { Metadata } from "next";
import EstimateBuilder from "@/components/EstimateBuilder";
import { SITE, money } from "@/lib/site";

export const metadata: Metadata = {
	title: "Price List",
	description:
		"Full Deepavali 2026 cracker price list. Build your list and send it on WhatsApp for a same-day estimate. Enquiry only — no online sale.",
};

export default function ProductsPage() {
	return (
		<>
			<section className="border-b border-line bg-shell py-8">
				<div className="mx-auto max-w-[1170px] px-4">
					<h1 className="text-2xl font-bold text-ink sm:text-3xl">List of Products</h1>
					<p className="mt-2 max-w-2xl text-[15px] leading-6 text-ink-soft">
						Set the quantity against anything you want. Your total updates as you go —
						then tap <strong>Send list on WhatsApp</strong> and we&apos;ll call you back
						the same day with a final estimate including transport.
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
						for firecracker sales in India. Minimum order {money(SITE.minOrder)}.
					</div>

					<EstimateBuilder />
				</div>
			</section>
		</>
	);
}
