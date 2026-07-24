import Link from "next/link";
import Image from "next/image";
import { money, publicSite } from "@/lib/site";
import { getSettings } from "@/lib/catalog";
import { CATEGORIES } from "@/lib/catalogue";
import Fireworks from "@/components/Fireworks";
import FireworksCanvas from "@/components/FireworksCanvas";
import FeaturedCarousel from "@/components/FeaturedCarousel";
import Reveal from "@/components/Reveal";
import {
	MedalIcon,
	TruckIcon,
	LeafIcon,
	RupeeCardIcon,
	HangingLamp,
	SparkBurst,
} from "@/components/icons";
import type { ComponentType } from "react";

const FEATURES: { Icon: ComponentType<{ className?: string }>; title: string; body: string }[] = [
	{
		Icon: MedalIcon,
		title: "Quality Products",
		body: "We buy in bulk at Sivakasi from established manufacturers and store under a licensed magazine. The same boxes the big shops sell — at the rate we buy them for.",
	},
	{
		Icon: TruckIcon,
		title: "Delivery",
		body: "Free transport-office delivery across South India. Collect from your nearest depot — crackers cannot legally travel by courier.",
	},
	{
		Icon: LeafIcon,
		title: "Eco Friendly",
		body: "We stock NEERI-certified green crackers. Certified boxes carry a QR code — scan it and verify the formulation yourself. We don't call anything green that isn't.",
	},
	{
		Icon: RupeeCardIcon,
		title: "Payment Options",
		body: "We call you once your estimate is placed, then share UPI or bank details on the call. No payment is taken on this website. Cash on delivery is not available.",
	},
];

export default async function Home() {
	const site = publicSite(await getSettings());
	return (
		<>
			{/* ---------- TORAN / GARLAND ---------- */}
			<div className="toran" aria-hidden />

			{/* ---------- HERO ---------- */}
			<section className="night-bg relative overflow-hidden">
				<FireworksCanvas />
				<Fireworks />
				{/* hanging diyas — hand-drawn SVG lamps, not emoji */}
				<div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-around px-6 text-yellow">
					{Array.from({ length: 7 }).map((_, i) => (
						<span key={i} className="diya-glow" style={{ animationDelay: `${(i % 4) * 0.3}s` }}>
							<HangingLamp className="h-11 w-5" />
						</span>
					))}
				</div>

				{/* lg:pl-20 keeps the left-aligned headline clear of the fixed action rail. */}
				<div className="relative z-10 mx-auto max-w-[1280px] px-4 py-12 lg:py-16 lg:pl-20">
					<div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
						{/* ---- LEFT: brand + headline discount ---- */}
						<Reveal className="text-center lg:text-left">
							<div className="mb-5 flex justify-center lg:justify-start">
								<span className="logo-halo float inline-flex">
									<Image
										src="/brand-logo.png"
										alt="Standard Fireworks"
										width={411}
										height={108}
										priority
										className="h-14 w-auto sm:h-16"
									/>
								</span>
							</div>
							<p className="text-[14px] font-semibold tracking-[0.3em] text-yellow">
								✦ DIRECT FROM SIVAKASI ✦
							</p>
							<h1 className="mt-2 text-5xl font-black leading-none sm:text-7xl">
								<span className="gold-text underline-spark">FLAT {site.discountPct}%</span>
								<span className="mt-2 block text-3xl font-extrabold text-white sm:text-4xl">
									OFF THE PRICE LIST
								</span>
							</h1>
							<p className="mt-3 text-[16px] text-white/80">
								Real Sivakasi crackers at wholesale rate — plus extra savings the more you
								buy. Booking open for Deepavali 2026.
							</p>
						</Reveal>

						{/* ---- RIGHT: spend-more-save-more slabs ---- */}
						<Reveal delay={120}>
							<div className="mx-auto max-w-sm rounded-xl border border-yellow/40 bg-black/25 p-4 shadow-xl backdrop-blur-sm">
								<p className="flex items-center justify-center gap-2 text-center text-[15px] font-bold uppercase tracking-wider text-yellow">
									<SparkBurst className="h-4 w-4" /> Buy More · Save More
								</p>
								<div className="mt-3 space-y-2">
									{site.discountTiers.map((t, i) => (
										<div
											key={t.min}
											className="tier-row flex items-center justify-between rounded-lg border border-white/15 bg-gradient-to-r from-white/10 to-transparent px-3 py-2.5"
											style={{ animationDelay: `${i * 0.25}s` }}
										>
											<span className="text-[16px] font-semibold text-white">
												{t.label}
											</span>
											<span className="flex items-center gap-1 text-[16px] font-extrabold text-yellow">
												+{t.extra}%
												<span className="text-[13px] font-medium text-white/60">extra off</span>
											</span>
										</div>
									))}
								</div>
								<p className="mt-2 text-center text-[13px] text-white/45">
									Extra discount applied on top of the {site.discountPct}% list-price rate.
								</p>

								{/* ---- CENTER-BOTTOM: order button ---- */}
								<Link
									href="/products"
									className="glow-btn shimmer mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-gold via-yellow to-[#eaa72a] py-3 text-sm font-extrabold text-[#3a1a00]"
								>
									<SparkBurst className="h-4 w-4" /> ORDER NOW
								</Link>
							</div>
						</Reveal>
					</div>
				</div>

				{/* marquee-style announcement (editable in /admin → Settings) */}
				<div className="relative z-10 overflow-hidden bg-[#1c1c1c] py-2">
					<div className="marquee whitespace-nowrap text-[14px] font-semibold tracking-[0.2em] text-yellow">
						✦ {site.announcement} · MINIMUM ORDER {money(site.minOrder)} · ✦&nbsp;&nbsp;&nbsp;
						✦ {site.announcement} · MINIMUM ORDER {money(site.minOrder)} · ✦&nbsp;&nbsp;&nbsp;
					</div>
				</div>
			</section>

			{/* ---------- FEATURED (auto-advancing carousel — one at a time) ---------- */}
			<section className="py-12">
				<div className="mx-auto max-w-[1000px] px-4">
					<div className="mb-6 flex items-end justify-between gap-4">
						<div>
							<h2 className="text-2xl font-bold text-ink sm:text-3xl">Featured this season</h2>
							<p className="mt-1 text-[16px] text-muted">Our best-selling ranges — flip through or wait for the next.</p>
						</div>
						<Link href="/products" className="hidden text-[15px] font-semibold text-brand hover:underline sm:inline">
							See full price list →
						</Link>
					</div>

					<FeaturedCarousel
						items={CATEGORIES.map((c) => ({ id: c.id, name: c.name }))}
						discountPct={site.discountPct}
						whatsapp={site.whatsapp}
						brand={site.name}
					/>
				</div>
			</section>

			{/* ---------- PROMO GRID ---------- */}
			<section className="pb-12">
				<div className="mx-auto grid max-w-[1600px] md:grid-cols-2">
					<div className="flex min-h-[220px] items-center justify-center bg-brand p-8 text-center text-white">
						<div>
							<p className="text-3xl font-bold sm:text-4xl">
								FLAT {site.discountPct}% OFF
							</p>
							<p className="mt-1 text-lg">for all crackers</p>
							<p className="mt-3 text-[16px] text-white/85">
								Let our crackers light up your night this season.
							</p>
							<Link href="/products" className="btn-yellow mt-5">
								ORDER NOW
							</Link>
						</div>
					</div>

					<div className="flex min-h-[220px] items-center justify-center bg-shell p-8 text-center">
						<div>
							<p className="text-2xl font-semibold text-brand sm:text-3xl">
								Minimum order {money(site.minOrder)}
							</p>
							<p className="mx-auto mt-3 max-w-sm text-[16px] leading-6 text-ink-soft">
								We care about our community. Our crackers are safe and secure for you
								and your environment. Orders begin at {money(site.minOrder)} — below
								that, transport costs more than the crackers do.
							</p>
						</div>
					</div>

					<div className="flex min-h-[220px] items-center justify-center bg-shell p-8 text-center">
						<div>
							<p className="flex items-center justify-center gap-2 text-xl font-semibold text-ink sm:text-2xl">
								<TruckIcon className="h-6 w-6 text-brand" /> Free transport office delivery
							</p>
							<p className="mx-auto mt-3 max-w-md text-[16px] leading-6 text-brand">
								Available to all major cities in {site.serviceStates.join(", ")}.
							</p>
							<p className="mx-auto mt-2 max-w-md text-[15px] leading-5 text-muted">
								Pick your order up from the nearest transport office. All-India delivery
								to major cities — except Delhi-NCR and anywhere the sale of fireworks is
								banned.
							</p>
						</div>
					</div>

					<div className="flex min-h-[220px] items-center justify-center bg-brand-dark p-8 text-center text-white">
						<div>
							<p className="flex items-center justify-center gap-2 text-2xl font-bold sm:text-3xl">
								<MedalIcon className="h-7 w-7 text-yellow" /> Genuine Sivakasi Quality
							</p>
							<p className="mx-auto mt-3 max-w-md text-[16px] leading-6 text-white/85">
								Serving families across Chennai for over a decade. Bought in bulk,
								stored under a licensed magazine, and sold direct — so you get the real
								boxes at the real wholesale rate.
							</p>
							<Link href="/about" className="btn-yellow mt-5">
								ABOUT US
							</Link>
						</div>
					</div>
				</div>

				<div className="mt-8 text-center">
					<Link href="/products" className="btn-yellow">
						ORDER NOW
					</Link>
				</div>
			</section>

			{/* ---------- FEATURES ---------- */}
			{/* Inline icon-left rows in an asymmetric 2-col band — not the
			    icon-over-heading card grid. First row spans wide as a lead. */}
			<section className="bg-brand py-14 text-white">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="max-w-xl text-2xl font-bold sm:text-3xl">
						Why families across South India buy from us
					</h2>
					<div className="mt-9 grid gap-x-12 gap-y-9 sm:grid-cols-2">
						{FEATURES.map((f, i) => (
							<div
								key={f.title}
								className={`flex gap-4 ${i === 0 ? "sm:col-span-2 sm:max-w-3xl" : ""}`}
							>
								<f.Icon className="mt-0.5 h-9 w-9 flex-none text-yellow" />
								<div>
									<h3 className="text-lg font-semibold">{f.title}</h3>
									<p className="mt-1 text-[15.5px] leading-7 text-white/85">{f.body}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---------- DISCOUNT BAND ---------- */}
			<section className="night-bg relative overflow-hidden py-14 text-center text-white">
				<Fireworks />
				<div className="relative z-10 mx-auto max-w-[1170px] px-4">
					<h2 className="gold-ink text-2xl font-extrabold sm:text-4xl">
						{site.discountPct}% DISCOUNT ON ALL PRODUCTS
					</h2>
					<div className="gold-rule" />
					<p className="mx-auto mt-3 max-w-2xl text-[16px] text-white/75">
						We sell quality Sivakasi crackers to our customers at honest, reasonable
						rates — all through the season.
					</p>
					<ul className="mx-auto mt-5 space-y-1 text-[16px] text-white/85">
						<li>Boxes bought direct from Sivakasi manufacturers</li>
						<li>Stored under a licensed magazine</li>
						<li>The printed list price — no invented discounts</li>
						<li>A real person on the phone, not a call centre</li>
					</ul>
					<Link href="/about" className="btn-yellow mt-7">
						READ MORE
					</Link>
				</div>
			</section>

			{/* ---------- OCCASIONS ---------- */}
			<section className="bg-shell py-12">
				<div className="mx-auto max-w-[1170px] px-4 text-center">
					<h2 className="section-title">Every Celebration, Covered</h2>
					<div className="gold-rule" />
					<p className="mx-auto mt-3 max-w-3xl text-[16px] leading-6 text-ink-soft">
						We also supply crackers for Christmas, New Year, Pongal, weddings and temple
						functions. We are available to take orders round the year.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-2 text-[15px]">
						{[
							"Deepavali",
							"Christmas & New Year",
							"Pongal",
							"Weddings & Temple Functions",
						].map((t) => (
							<span
								key={t}
								className="inline-flex items-center gap-2 border border-line bg-white px-3.5 py-1.5"
							>
								<span className="h-1.5 w-1.5 rounded-full bg-yellow" aria-hidden />
								{t}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ---------- LEGAL ---------- */}
			<section className="py-10">
				<div className="mx-auto max-w-[1170px] px-4">
					<div className="rounded-lg border border-line bg-row p-5 text-[15.5px] leading-6 text-ink-soft">
						<p className="mb-1 flex items-center gap-2 font-semibold text-ink">
							<span className="h-3 w-3 flex-none rounded-[2px] bg-brand" aria-hidden />
							How ordering works — please read.
						</p>
						Sale and use of firecrackers in India is regulated by orders of the
						Hon&apos;ble Supreme Court and by the Explosives Act, 1884 / Explosives
						Rules, 2008.{" "}
						<strong>
							This website does not sell crackers online and does not accept online
							payment.
						</strong>{" "}
						The price list here is for enquiry only — you send us your list, we confirm
						availability and the final estimate by phone, and payment is completed
						offline. Delivery is by goods transport to your nearest transport office;
						crackers cannot legally be sent by courier or post. We do not deliver to
						Delhi-NCR or to any state where sale is banned.
					</div>
				</div>
			</section>
		</>
	);
}
