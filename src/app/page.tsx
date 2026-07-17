import Link from "next/link";
import Image from "next/image";
import { SITE, money, waLink } from "@/lib/site";
import { CATEGORIES } from "@/lib/catalogue";
import Fireworks from "@/components/Fireworks";
import Reveal from "@/components/Reveal";
import { CategoryIcon, WhatsAppIcon } from "@/components/icons";

const FEATURES = [
	{
		icon: "🏅",
		title: "Quality Products",
		body: "We buy in bulk at Sivakasi from established manufacturers and store under a licensed magazine. The same boxes the big shops sell — at the rate we buy them for.",
	},
	{
		icon: "🚚",
		title: "Delivery",
		body: `Free transport-office delivery across ${SITE.serviceStates.slice(0, 3).join(", ")} and more. Collect from your nearest depot — crackers cannot legally travel by courier.`,
	},
	{
		icon: "🌿",
		title: "Eco Friendly",
		body: "We stock NEERI-certified green crackers. Certified boxes carry a QR code — scan it and verify the formulation yourself. We don't call anything green that isn't.",
	},
	{
		icon: "💳",
		title: "Payment Options",
		body: "We call you once your estimate is placed, then share UPI or bank details on the call. No payment is taken on this website. Cash on delivery is not available.",
	},
];

export default function Home() {
	return (
		<>
			{/* ---------- TORAN / GARLAND ---------- */}
			<div className="toran" aria-hidden />

			{/* ---------- HERO ---------- */}
			<section className="relative overflow-hidden bg-gradient-to-b from-brand-deep via-brand-dark to-brand-deep">
				<Fireworks />
				{/* hanging diyas */}
				<div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 flex justify-around px-6 text-2xl">
					{["🪔", "🎆", "🪔", "🎇", "🪔", "🎆", "🪔"].map((d, i) => (
						<span
							key={i}
							className="diya-glow"
							style={{ animationDelay: `${(i % 4) * 0.3}s` }}
						>
							{d}
						</span>
					))}
				</div>

				{/* lg:pl-20 keeps the left-aligned headline clear of the fixed action rail. */}
				<div className="relative z-10 mx-auto max-w-[1280px] px-4 py-12 lg:py-16 lg:pl-20">
					<div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
						{/* ---- LEFT: brand + headline discount ---- */}
						<Reveal className="text-center lg:text-left">
							<div className="mb-4 flex justify-center lg:justify-start">
								<span className="inline-block rounded-lg bg-white px-4 py-2.5 shadow-lg">
									<Image
										src="/brand-logo.png"
										alt="Standard Fireworks"
										width={411}
										height={108}
										priority
										className="h-12 w-auto sm:h-14"
									/>
								</span>
							</div>
							<p className="text-[13px] font-semibold tracking-[0.3em] text-yellow">
								✦ DIRECT FROM SIVAKASI ✦
							</p>
							<h1 className="mt-2 text-5xl font-black leading-none sm:text-7xl">
								<span className="gold-text">FLAT {SITE.discountPct}%</span>
								<span className="mt-1 block text-3xl font-extrabold text-white sm:text-4xl">
									OFF THE PRICE LIST
								</span>
							</h1>
							<p className="mt-3 text-[15px] text-white/80">
								Real Sivakasi crackers at wholesale rate — plus extra savings the more you
								buy. Booking open for Deepavali 2026.
							</p>
						</Reveal>

						{/* ---- RIGHT: spend-more-save-more slabs ---- */}
						<Reveal delay={120}>
							<div className="mx-auto max-w-sm rounded-xl border border-yellow/40 bg-black/25 p-4 shadow-xl backdrop-blur-sm">
								<p className="text-center text-[14px] font-bold uppercase tracking-wider text-yellow">
									🎁 Buy More · Save More
								</p>
								<div className="mt-3 space-y-2">
									{SITE.discountTiers.map((t, i) => (
										<div
											key={t.min}
											className="tier-row flex items-center justify-between rounded-lg border border-white/15 bg-gradient-to-r from-white/10 to-transparent px-3 py-2.5"
											style={{ animationDelay: `${i * 0.25}s` }}
										>
											<span className="text-[15px] font-semibold text-white">
												{t.label}
											</span>
											<span className="flex items-center gap-1 text-[15px] font-extrabold text-yellow">
												+{t.extra}%
												<span className="text-[12px] font-medium text-white/60">extra off</span>
											</span>
										</div>
									))}
								</div>
								<p className="mt-2 text-center text-[12px] text-white/45">
									Extra discount applied on top of the {SITE.discountPct}% list-price rate.
								</p>

								{/* ---- CENTER-BOTTOM: order button ---- */}
								<Link
									href="/products"
									className="glow-btn mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow to-[#f6a41c] py-3 text-sm font-extrabold text-[#3a1a00]"
								>
									🎇 ORDER NOW
								</Link>
							</div>
						</Reveal>
					</div>

					<p className="mt-6 text-center text-[12px] text-white/30">
						[ Discount slabs are placeholders — client to confirm the real ₹ thresholds ]
					</p>
				</div>

				{/* marquee-style announcement */}
				<div className="relative z-10 overflow-hidden bg-[#1c1c1c] py-2">
					<div className="marquee whitespace-nowrap text-[13px] font-semibold tracking-[0.2em] text-yellow">
						🎆 BOOKING OPEN FOR DEEPAVALI 2026 · MINIMUM ORDER {money(SITE.minOrder)} · BOOK EARLY FOR BEST STOCK · FREE TRANSPORT-OFFICE DELIVERY ACROSS SOUTH INDIA · 🎆&nbsp;&nbsp;&nbsp;
						🎆 BOOKING OPEN FOR DEEPAVALI 2026 · MINIMUM ORDER {money(SITE.minOrder)} · BOOK EARLY FOR BEST STOCK · FREE TRANSPORT-OFFICE DELIVERY ACROSS SOUTH INDIA · 🎆&nbsp;&nbsp;&nbsp;
					</div>
				</div>
			</section>

			{/* ---------- CATEGORIES ---------- */}
			<section className="py-12">
				<div className="mx-auto max-w-[1170px] px-4">
					<h2 className="section-title">Categories</h2>
					<div className="gold-rule" />
					<p className="section-sub">Best quality and quantity crackers.</p>

					<div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
						{CATEGORIES.map((c) => (
							<Reveal
								key={c.id}
								className="group border border-line bg-white transition-shadow hover:-translate-y-1 hover:shadow-lg"
							>
							<Link href={`/products#${c.id}`} className="block">
								<div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#fff7e6] to-[#fdeccb]">
									<CategoryIcon
										id={c.id}
										className="h-16 w-16 text-brand transition-transform duration-300 group-hover:scale-110"
									/>
								</div>
								<div className="border-t border-line px-3 py-2.5 text-center">
									<p className="text-sm font-semibold text-ink group-hover:text-brand">
										{c.name}
									</p>
									<p className="text-[13px] text-muted">View prices →</p>
								</div>
							</Link>
							</Reveal>
						))}
					</div>
				</div>
			</section>

			{/* ---------- PROMO GRID ---------- */}
			<section className="pb-12">
				<div className="mx-auto grid max-w-[1600px] md:grid-cols-2">
					<div className="flex min-h-[220px] items-center justify-center bg-brand p-8 text-center text-white">
						<div>
							<p className="text-3xl font-bold sm:text-4xl">
								FLAT {SITE.discountPct}% OFF
							</p>
							<p className="mt-1 text-lg">for all crackers</p>
							<p className="mt-3 text-[15px] text-white/85">
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
								Minimum order {money(SITE.minOrder)}
							</p>
							<p className="mx-auto mt-3 max-w-sm text-[15px] leading-6 text-ink-soft">
								We care about our community. Our crackers are safe and secure for you
								and your environment. Orders begin at {money(SITE.minOrder)} — below
								that, transport costs more than the crackers do.
							</p>
						</div>
					</div>

					<div className="flex min-h-[220px] items-center justify-center bg-shell p-8 text-center">
						<div>
							<p className="text-xl font-semibold text-ink sm:text-2xl">
								🚚 Free transport office delivery
							</p>
							<p className="mx-auto mt-3 max-w-md text-[15px] leading-6 text-brand">
								Available to all major cities in {SITE.serviceStates.join(", ")}.
							</p>
							<p className="mx-auto mt-2 max-w-md text-[14px] leading-5 text-muted">
								Pick your order up from the nearest transport office. All-India delivery
								to major cities — except Delhi-NCR and anywhere the sale of fireworks is
								banned.
							</p>
						</div>
					</div>

					<div className="flex min-h-[220px] items-center justify-center bg-brand-dark p-8 text-center">
						<span className="text-[13px] text-white/55">
							[ Promo image placeholder — client&apos;s own artwork ]
						</span>
					</div>
				</div>

				<div className="mt-8 text-center">
					<Link href="/products" className="btn-yellow">
						ORDER NOW
					</Link>
				</div>
			</section>

			{/* ---------- FEATURES ---------- */}
			<section className="bg-brand py-14 text-white">
				<div className="mx-auto grid max-w-[1170px] gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
					{FEATURES.map((f) => (
						<div key={f.title} className="text-center">
							<div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-full bg-white/15 text-2xl">
								{f.icon}
							</div>
							<h3 className="mb-2 text-base font-semibold">{f.title}</h3>
							<p className="text-[14.5px] leading-6 text-white/85">{f.body}</p>
						</div>
					))}
				</div>
			</section>

			{/* ---------- DISCOUNT BAND ---------- */}
			<section className="relative overflow-hidden bg-[#111] py-14 text-center text-white">
				<div aria-hidden className="pointer-events-none absolute inset-0">
					<span className="firework" style={{ left: "15%", top: "30%" }} />
					<span className="firework" style={{ left: "85%", top: "40%", animationDelay: "1.3s" }} />
				</div>
				<div className="relative z-10 mx-auto max-w-[1170px] px-4">
					<h2 className="gold-title text-2xl font-extrabold sm:text-4xl">
						{SITE.discountPct}% DISCOUNT ON ALL PRODUCTS
					</h2>
					<div className="gold-rule" />
					<p className="mx-auto mt-3 max-w-2xl text-[15px] text-white/75">
						We sell quality Sivakasi crackers to our customers at honest, reasonable
						rates — all through the season.
					</p>
					<ol className="mx-auto mt-5 space-y-1 text-[15px] text-white/85">
						<li>1. Superior quality products</li>
						<li>2. Sound infrastructure</li>
						<li>3. Reasonable rate</li>
						<li>4. 100% customer satisfaction</li>
					</ol>
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
					<p className="mx-auto mt-3 max-w-3xl text-[15px] leading-6 text-ink-soft">
						We also supply crackers for Christmas, New Year, Pongal, weddings and temple
						functions. We are available to take orders round the year.
					</p>
					<div className="mt-6 flex flex-wrap justify-center gap-2 text-[14px]">
						{[
							"🪔 Deepavali",
							"🎄 Christmas & New Year",
							"🌾 Pongal",
							"💒 Weddings & Temple Functions",
						].map((t) => (
							<span key={t} className="border border-line bg-white px-3 py-1.5">
								{t}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ---------- LEGAL ---------- */}
			<section className="py-10">
				<div className="mx-auto max-w-[1170px] px-4">
					<div className="border-l-4 border-brand bg-row p-5 text-[14.5px] leading-6 text-ink-soft">
						<p className="mb-1 font-semibold text-ink">
							⚖️ How ordering works — please read.
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
