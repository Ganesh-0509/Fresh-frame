import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import EnquiryForm from "@/components/EnquiryForm";
import { SITE, telLink, waLink } from "@/lib/site";

export const metadata: Metadata = {
	title: "Contact Us",
	description: "Call or WhatsApp us for your Deepavali cracker order. Sivakasi, Tamil Nadu.",
};

export default function ContactPage() {
	const rows: { icon: string; label: string; value: React.ReactNode }[] = [
		{
			icon: "📞",
			label: "Phone",
			value: (
				<a href={telLink()} className="hover:text-brand">
					{SITE.phone}
				</a>
			),
		},
		{
			icon: "💬",
			label: "WhatsApp",
			value: (
				<a
					href={waLink(`Hi ${SITE.name}, I'd like to enquire about your crackers.`)}
					target="_blank"
					rel="noopener"
					className="font-semibold text-[#25D366] hover:underline"
				>
					Message us now →
				</a>
			),
		},
		{
			icon: "✉️",
			label: "Email",
			value: (
				<a href={`mailto:${SITE.email}`} className="hover:text-brand">
					{SITE.email}
				</a>
			),
		},
		{
			icon: "📍",
			label: "Address",
			value: (
				<>
					{SITE.address.line1}
					<br />
					{SITE.address.line2}
					<br />
					{SITE.address.line3}
				</>
			),
		},
		{ icon: "🕒", label: "Hours", value: SITE.hours },
		...(SITE.gst ? [{ icon: "🧾", label: "GSTIN", value: SITE.gst }] : []),
		...(SITE.licence
			? [{ icon: "🛡️", label: "Explosives licence", value: SITE.licence }]
			: []),
	];

	return (
		<>
			<PageHeader
				title="Contact Us"
				subtitle="WhatsApp is fastest, especially in season. Send your list or just ask — a real person answers."
			/>

			<section className="py-12">
				<div className="mx-auto grid max-w-[1170px] gap-8 px-4 lg:grid-cols-2">
					{/* ---- details ---- */}
					<div className="space-y-6">
						<div className="border border-line bg-white p-6">
							<h2 className="mb-4 text-lg font-semibold text-ink">Reach us</h2>
							<dl>
								{rows.map((r) => (
									<div
										key={r.label}
										className="flex gap-3 border-b border-line py-3 last:border-b-0"
									>
										<span className="w-6 flex-none text-lg">{r.icon}</span>
										<div>
											<dt className="text-[12px] font-semibold uppercase tracking-wider text-brand">
												{r.label}
											</dt>
											<dd className="text-[15px] leading-6 text-ink-soft">
												{r.value}
											</dd>
										</div>
									</div>
								))}
							</dl>
						</div>

						<div className="border border-line bg-white p-6">
							<h2 className="mb-2 text-base font-semibold text-ink">
								🚚 Where we deliver
							</h2>
							<p className="text-[15px] leading-6 text-ink-soft">
								Free delivery to your nearest <strong>transport office</strong> in:
							</p>
							<p className="mt-2 text-[15px] font-semibold leading-6 text-brand">
								{SITE.serviceStates.join(" · ")}
							</p>
							<p className="mt-3 text-[14px] leading-5 text-muted">
								Crackers cannot legally travel by courier or post — every order goes by
								goods transport and is collected from the depot. We do not deliver to
								Delhi-NCR or to states where sale is banned.
							</p>
						</div>

						<div className="ph aspect-[21/9]">
							🗺️ [ Google Maps embed goes here ]
							<br />
							Maps → the business → Share → Embed a map → paste the iframe
						</div>
					</div>

					{/* ---- form ---- */}
					<div className="space-y-4">
						<EnquiryForm />
						<div className="border-l-4 border-brand bg-row p-4 text-[14.5px] leading-6 text-ink-soft">
							<strong className="text-ink">⚖️ No online sale.</strong> This form sends a
							WhatsApp message — it does not place an order or take payment. We confirm
							stock and the final amount with you by phone, and payment is arranged
							offline, as required for firecracker sales in India.
						</div>
					</div>
				</div>
			</section>
		</>
	);
}
