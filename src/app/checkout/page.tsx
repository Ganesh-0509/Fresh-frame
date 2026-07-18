import type { Metadata } from "next";
import CheckoutFlow from "@/components/CheckoutFlow";
import { getCatalog, getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
	title: "Checkout",
	description:
		"Confirm your details and complete payment for your cracker order. Payment is manual (UPI / bank) — share the receipt on WhatsApp and we verify it before dispatch.",
};

export default async function CheckoutPage() {
	const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
	return (
		<>
			<section className="border-b border-line bg-shell py-8">
				<div className="mx-auto max-w-[860px] px-4">
					<h1 className="text-2xl font-bold text-ink sm:text-3xl">Checkout</h1>
					<p className="mt-2 text-[15px] leading-6 text-ink-soft">
						Three quick steps — your details, payment, then send us the receipt on
						WhatsApp. No payment is processed on this website.
					</p>
				</div>
			</section>

			<section className="py-8">
				<div className="mx-auto max-w-[860px] px-4">
					<CheckoutFlow products={catalog.products} settings={settings} />
				</div>
			</section>
		</>
	);
}
