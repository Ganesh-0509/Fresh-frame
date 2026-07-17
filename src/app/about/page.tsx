import type { Metadata } from "next";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
	title: "About Us",
	description:
		"A Sivakasi family in the fireworks trade. We source wholesale, store under licence, and sell direct to families across South India.",
};

const VALUES = [
	{
		icon: "🛡️",
		title: "Licensed & legal",
		body: "We hold the explosives licence required to store and sell fireworks, and we operate within the Explosives Rules, 2008 and the Supreme Court's orders on firecracker sale.",
	},
	{
		icon: "🌿",
		title: "Genuinely green",
		body: "We stock NEERI-certified green crackers. Certified boxes carry a QR code — scan it with the CSIR-NEERI app and verify the formulation yourself. We don't label anything green that isn't.",
	},
	{
		icon: "🏷️",
		title: "One honest price",
		body: "The price list is the price. We don't quote one rate on WhatsApp and another on the phone, and we don't invent a fake discount off a fake list price.",
	},
	{
		icon: "📦",
		title: "Packed for the road",
		body: "Every order is packed for lorry transport and checked before it leaves. If something arrives damaged, call us — we'll make it right.",
	},
];

const SAFETY = [
	{ icon: "👀", title: "Adults, always", body: "Children should never light crackers without an adult standing with them. Not nearby — with them." },
	{ icon: "🪣", title: "Water ready", body: "Keep a bucket of water and sand within reach before you light the first one, not after." },
	{ icon: "🚫", title: "Never relight a dud", body: "If it doesn't go off, leave it. Soak it in water after a few minutes. Never lean over it." },
	{ icon: "👕", title: "Cotton, not synthetics", body: "Loose synthetic clothing catches and melts. Cotton is safer. Tie long hair back." },
	{ icon: "📏", title: "Open space only", body: "Light in the open, away from vehicles, thatch, dry leaves and gas cylinders. Never indoors or on a balcony." },
	{ icon: "🕕", title: "Respect the timing", body: "Courts set the bursting window each year — usually two short slots. Respect it, and keep clear of silence zones near hospitals." },
];

export default function AboutPage() {
	return (
		<>
			<PageHeader
				title="About Us"
				subtitle="Sivakasi makes the overwhelming majority of India's fireworks. We're a family business from here, and we cut out every step between the factory and your front door."
			/>

			<section className="py-12">
				<div className="mx-auto grid max-w-[1170px] items-center gap-10 px-4 md:grid-cols-2">
					<div className="ph aspect-[4/3]">
						[ Shop / godown photo ]
						<br />
						approx. 1200×900
					</div>
					<div>
						<h2 className="mb-4 text-2xl font-semibold text-ink">Our story</h2>
						<p className="mb-4 text-[15px] leading-7 text-ink-soft">
							Murugan Traders has been in the fireworks trade for{" "}
							<strong>over 12 years</strong>. What began as a small seasonal stall in
							Avadi — a few boxes brought up from Sivakasi each Deepavali — has grown, one
							honest order at a time, into a business that families across Chennai come
							back to every year.
						</p>
						<p className="mb-4 text-[15px] leading-7 text-ink-soft">
							We buy wholesale straight from established Sivakasi manufacturers and sell
							direct — to families, temples, schools and function organisers. No showroom
							rent, no salesmen, no commission agents. That is the whole reason our rate is
							what it is.
						</p>
						<p className="text-[15px] leading-7 text-ink-soft">
							Twelve years on, the promise hasn&apos;t changed: the same crackers the big
							shops sell, at the price we buy them for — and a real person on the other end
							of the phone.
						</p>
						<p className="mt-3 text-[14px] italic text-muted">
							[ Draft story — confirm the real details with the client (exactly when it
							started, who founded it, any family history) and replace freely. ]
						</p>
						{SITE.stockistOf && (
							<p className="mt-4 text-[15px] leading-7 text-ink-soft">
								We stock products from <strong>{SITE.stockistOf}</strong>.
							</p>
						)}
					</div>
				</div>
			</section>

			<section className="bg-shell py-12">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="section-title">What we stand on</h2>
					<p className="section-sub">Four things we don&apos;t compromise.</p>
					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
						{VALUES.map((v) => (
							<div key={v.title} className="border border-line bg-white p-5">
								<div className="mb-3 text-2xl">{v.icon}</div>
								<h3 className="mb-2 text-[15px] font-semibold text-ink">{v.title}</h3>
								<p className="text-[14.5px] leading-6 text-muted">{v.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-12">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="section-title">Please burst responsibly</h2>
					<p className="section-sub">
						Crackers are explosives. Every year people are hurt by things that were
						entirely avoidable.
					</p>
					<div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
						{SAFETY.map((s) => (
							<div key={s.title} className="border-l-4 border-brand bg-row p-4">
								<h3 className="mb-1 text-[14px] font-semibold text-ink">
									{s.icon} {s.title}
								</h3>
								<p className="text-[14.5px] leading-6 text-muted">{s.body}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="bg-brand py-12 text-center text-white">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="text-2xl font-bold sm:text-3xl">Ready to book?</h2>
					<p className="mx-auto mt-3 max-w-xl text-[15px] text-white/85">
						Build your list from our price list and send it over. We&apos;ll call you
						back the same day with the final estimate.
					</p>
					<Link href="/products" className="btn-yellow mt-6">
						VIEW THE PRICE LIST
					</Link>
				</div>
			</section>
		</>
	);
}
