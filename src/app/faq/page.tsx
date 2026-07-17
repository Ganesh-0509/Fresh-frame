import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { SITE, money } from "@/lib/site";

export const metadata: Metadata = {
	title: "FAQ",
	description:
		"How ordering, delivery and payment work. Answers on green crackers, transport, minimum order and the legal rules on firecracker sale in India.",
};

type QA = { q: string; a: React.ReactNode };

const GROUPS: { heading: string; items: QA[] }[] = [
	{
		heading: "Ordering",
		items: [
			{
				q: "How do I place an order?",
				a: (
					<>
						Open the{" "}
						<Link href="/products" className="text-brand underline">
							price list
						</Link>
						, set the quantity against whatever you want, and tap{" "}
						<strong>Send list on WhatsApp</strong>. Your list arrives with us as a
						message. We check stock, add transport, and call you back the same day with
						the final estimate. Nothing is confirmed until you say yes on that call.
					</>
				),
			},
			{
				q: "Can I just buy directly on the website?",
				a: (
					<>
						No — and no legitimate firecracker seller in India can offer that. The
						Supreme Court&apos;s orders prohibit the online sale of firecrackers, so this
						site is an enquiry and price-list tool only. Your order is confirmed by phone
						and paid for offline. Anyone offering you a &ldquo;Buy Now&rdquo; button for
						crackers is not operating within the rules.
					</>
				),
			},
			{
				q: "Is there a minimum order?",
				a: (
					<>
						Yes — <strong>{money(SITE.minOrder)}</strong>. Below that, transport costs
						more than the crackers do, so it isn&apos;t worth it for either of us.
					</>
				),
			},
			{
				q: "When should I book?",
				a: "As early as you can. Orders are packed in the order they're confirmed, and in the last two weeks before Deepavali both stock and lorry space get tight. Booking early gets you a better selection and a better transport slot — not a better price, we don't play that game.",
			},
			{
				q: "Can I change my list after sending it?",
				a: "Of course — until you've confirmed on the call and paid the advance, nothing is locked. Just message us the change.",
			},
		],
	},
	{
		heading: "Payment",
		items: [
			{
				q: "How do I pay?",
				a: (
					<>
						After we confirm your order on the phone, we share our UPI ID or bank details
						with you directly. You transfer and send us the screenshot.{" "}
						<strong>We never collect payment through this website</strong> — there is no
						payment gateway here, by design.
					</>
				),
			},
			{
				q: "Is cash on delivery available?",
				a: "No. Goods transport operators don't collect payment on our behalf, so orders are settled before dispatch.",
			},
			{ q: "Will I get a bill?", a: "Yes — a proper GST invoice with every order." },
		],
	},
	{
		heading: "Delivery",
		items: [
			{
				q: "Where do you deliver?",
				a: (
					<>
						To your nearest <strong>transport office</strong> across{" "}
						{SITE.serviceStates.join(", ")}. You collect your parcel from the depot with
						your ID and the LR number we send you. We&apos;ll tell you the exact office
						when we call.
					</>
				),
			},
			{
				q: "Why can't you courier it to my house?",
				a: "Because it's illegal, not because we don't want to. Fireworks are explosives — they're a prohibited item in the post, and DHL, FedEx, Professional Courier and the rest all refuse flammable goods. Every genuine Sivakasi seller ships by goods transport to a depot. Anyone promising doorstep courier delivery of crackers is either lying or breaking the law.",
			},
			{
				q: "Do you deliver to Delhi / NCR?",
				a: "No. Firecracker sale in Delhi-NCR is restricted by ongoing Supreme Court orders that change from year to year, and crackers may not be brought into the region from outside. We also don't send to any other state where sale is banned at the time of your order.",
			},
			{
				q: "How long does it take?",
				a: "Within Tamil Nadu, typically 2–3 days after dispatch. Elsewhere in South India, 3–6 days. During the Deepavali rush, add a few days — the lorries are as busy as we are.",
			},
		],
	},
	{
		heading: "Products & safety",
		items: [
			{
				q: "Are your crackers green crackers?",
				a: "The ones that are certified are labelled as such — and they carry a QR code you can scan with the CSIR-NEERI app to verify the formulation for yourself. We won't put '100% green' across our whole catalogue the way some sites do; that claim only means something when it's certified, and we'd rather you could check.",
			},
			{
				q: "What are green crackers, exactly?",
				a: "They're formulations developed by CSIR-NEERI with PESO that drop barium salts and cut particulate emissions by roughly 30–40% compared with conventional crackers. Barium-based crackers are banned nationwide by the Supreme Court.",
			},
			{
				q: `Are the prices really ${SITE.discountPct}% off?`,
				a: "Our discount is off the printed manufacturer list price, which is how the whole Sivakasi trade quotes. What matters is the number in the 'Your price' column — that's what you actually pay, and it's the same number we'll say on the phone.",
			},
			{
				q: "What's the timing rule for bursting?",
				a: "Courts set a bursting window each year — in Tamil Nadu it has recently been two one-hour slots, typically early morning and evening. It changes year to year, so check the current year's notification before Deepavali, and keep clear of silence zones near hospitals.",
			},
		],
	},
];

export default function FaqPage() {
	return (
		<>
			<PageHeader
				title="Frequently Asked Questions"
				subtitle="If your question isn't here, just WhatsApp us — a real person answers."
			/>

			<section className="py-12">
				<div className="mx-auto max-w-3xl px-4">
					{GROUPS.map((g) => (
						<div key={g.heading} className="mb-10">
							<h2 className="mb-4 border-b-2 border-brand pb-2 text-lg font-semibold text-brand">
								{g.heading}
							</h2>
							<div className="border border-line">
								{g.items.map((item, i) => (
									<details
										key={item.q}
										className="group border-b border-line last:border-b-0"
										open={i === 0 && g.heading === "Ordering"}
									>
										<summary className="flex cursor-pointer items-center justify-between gap-4 px-4 py-3.5 text-[14px] font-medium text-ink hover:bg-row">
											{item.q}
											<span className="flex-none text-xl text-brand transition-transform group-open:rotate-45">
												+
											</span>
										</summary>
										<div className="px-4 pb-4 text-[15px] leading-7 text-muted">
											{item.a}
										</div>
									</details>
								))}
							</div>
						</div>
					))}

					<div className="border-l-4 border-brand bg-row p-5 text-[14.5px] leading-6 text-ink-soft">
						<strong className="text-ink">⚖️ The legal bit.</strong> Sale and use of
						firecrackers in India is governed by orders of the Hon&apos;ble Supreme Court
						and by the Explosives Act, 1884 and Explosives Rules, 2008. This website does
						not sell crackers online and does not accept online payment; it is a price
						list and enquiry tool only. Rules on permitted crackers, bursting windows and
						regional bans change from year to year — please check the current position for
						your state before ordering.
					</div>
				</div>
			</section>
		</>
	);
}
