import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/catalog";
import { emailConfigured, ownerEmail } from "@/lib/email";
import { saveSettingsAction, sendTestEmailAction } from "./actions";
import ImageInput from "./ImageInput";

export const dynamic = "force-dynamic";

export default async function AdminSettings({
	searchParams,
}: {
	searchParams: Promise<{ saved?: string; test?: string }>;
}) {
	await requireAdmin();
	const s = await getSettings();
	const mail = emailConfigured();
	const inbox = ownerEmail();
	const { saved, test } = await searchParams;

	return (
		<div>
			<h1 className="mb-1 text-2xl font-bold">Settings</h1>
			<p className="mb-6 text-[13.5px] text-white/60">
				Payment, delivery and pricing details shown on the website. Changes go live
				immediately.
			</p>

			{saved && (
				<p className="mb-4 rounded border border-emerald-400/30 bg-emerald-400/10 p-3 text-[14px] text-emerald-200">
					✓ Settings saved.
				</p>
			)}

			<div className="mb-6 rounded border border-white/10 bg-white/5 p-4">
				<h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-white/50">
					Email notifications (Resend)
				</h2>
				<div className="flex flex-wrap items-center gap-2">
					<span className={`h-2.5 w-2.5 rounded-full ${mail ? "bg-emerald-400" : "bg-red-400"}`} />
					<span className="font-semibold">{mail ? "Connected" : "Not connected"}</span>
					<span className="text-[13px] text-white/50">
						{mail
							? `— new orders and status updates auto-send; owner alerts go to ${inbox}.`
							: "— add RESEND_API_KEY + EMAIL_FROM as secrets to enable auto-email."}
					</span>
				</div>

				{test === "ok" && (
					<p className="mt-3 rounded border border-emerald-400/30 bg-emerald-400/10 p-2.5 text-[13.5px] text-emerald-200">
						✓ Test email sent to {inbox}. Check that inbox (and spam) — if it arrived, email is working.
					</p>
				)}
				{test === "fail" && (
					<p className="mt-3 rounded border border-red-400/30 bg-red-400/10 p-2.5 text-[13.5px] text-red-200">
						✕ Send failed. Usually means the domain in EMAIL_FROM isn&apos;t verified in Resend yet, or the API key is wrong.
					</p>
				)}
				{test === "unconfigured" && (
					<p className="mt-3 rounded border border-yellow/30 bg-yellow/10 p-2.5 text-[13.5px] text-yellow">
						Email isn&apos;t set up yet — add the RESEND_API_KEY + EMAIL_FROM secrets first.
					</p>
				)}

				<form action={sendTestEmailAction} className="mt-3">
					<button className="rounded border border-white/20 px-3 py-1.5 text-[13px] font-semibold text-white/80 hover:bg-white/10">
						Send test email
					</button>
				</form>
			</div>

			<form action={saveSettingsAction} className="space-y-6">
				<Section title="Payment">
					<Field name="upi" label="UPI ID" def={s.upi} />
					<div className="sm:col-span-2">
						<ImageInput name="upiQr" label="UPI QR code (upload)" defaultValue={s.upiQr} />
					</div>
					<Field name="bankHolder" label="Account holder" def={s.bankHolder} />
					<Field name="bankName" label="Bank name" def={s.bankName} />
					<Field name="bankBranch" label="Branch" def={s.bankBranch} />
					<Field name="bankAccount" label="Account number" def={s.bankAccount} />
					<Field name="bankIfsc" label="IFSC" def={s.bankIfsc} />
				</Section>

				<Section title="Contact">
					<Field name="phone" label="Phone / GPay" def={s.phone} />
					<Field name="whatsapp" label="WhatsApp (digits, e.g. 9193…)" def={s.whatsapp} />
					<Field name="email" label="Email" def={s.email} />
				</Section>

				<Section title="Pricing & delivery">
					<Field name="minOrder" label="Minimum order (₹)" def={String(s.minOrder)} type="number" />
					<Field name="discountPct" label="Headline discount %" def={String(s.discountPct)} type="number" />
					<Field name="gstPct" label="GST % (0 = off)" def={String(s.gstPct)} type="number" />
					<label className="flex items-center gap-2 text-[13px] text-white/70">
						<input type="checkbox" name="requireUtr" defaultChecked={s.requireUtr} />
						Require UTR at payment confirmation
					</label>
					<div className="sm:col-span-2">
						<label className="mb-1 block text-[13px] text-white/70">
							Delivery states (comma-separated)
						</label>
						<textarea
							name="serviceStates"
							defaultValue={s.serviceStates.join(", ")}
							rows={2}
							className="w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
						/>
						<p className="mt-1 text-[12px] text-white/45">
							Add/remove a state, Save, then set its transport fee + cities below.
						</p>
					</div>
				</Section>

				<Section title="Transport fee & cities (per state)">
					<div className="sm:col-span-2 space-y-3">
						<p className="text-[12.5px] text-white/50">
							Transport fee is auto-added at checkout for the customer&apos;s state. City is a
							dropdown of the cities you list here (comma-separated) — customers can&apos;t
							order to a city you don&apos;t serve.
						</p>
						{s.serviceStates.map((st) => (
							<div key={st} className="rounded border border-white/10 bg-white/5 p-3">
								<div className="mb-2 flex items-center justify-between gap-3">
									<span className="font-semibold">{st}</span>
									<label className="flex items-center gap-2 text-[13px] text-white/70">
										Transport ₹
										<input
											name={`fee::${st}`}
											type="number"
											min={0}
											defaultValue={s.transportFees[st] ?? 0}
											className="w-28 rounded border border-white/20 bg-white/5 px-2 py-1.5 text-white outline-none focus:border-brand"
										/>
									</label>
								</div>
								<label className="block text-[12.5px] text-white/60">
									Cities (comma-separated)
									<textarea
										name={`cities::${st}`}
										defaultValue={(s.serviceCities[st] ?? []).join(", ")}
										rows={2}
										className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
									/>
								</label>
							</div>
						))}
					</div>
				</Section>

				<Section title="Business identity (shown in header, footer & contact)">
					<Field name="tagline" label="Tagline" def={s.tagline} />
					<Field name="hours" label="Opening hours" def={s.hours} />
					<Field name="addressLine" label="Address line" def={s.addressLine} />
					<Field name="legalName" label="Registered / firm name" def={s.legalName} />
					<Field name="gstNumber" label="GSTIN (blank = hidden)" def={s.gstNumber} />
					<Field name="licence" label="Explosives licence no. (blank = hidden)" def={s.licence} />
					<div className="sm:col-span-2">
						<Field
							name="stockistOf"
							label="Brand we stock (only if allowed in writing — blank = hidden)"
							def={s.stockistOf}
						/>
					</div>
				</Section>

				<Section title="Buy more · save more slabs (hero)">
					<div className="sm:col-span-2 space-y-2">
						<p className="text-[12.5px] text-white/50">
							Extra % off when a customer spends at least ₹X. Leave the spend blank to
							remove a slab. Up to 4.
						</p>
						{[0, 1, 2, 3].map((i) => {
							const t = s.discountTiers[i];
							return (
								<div key={i} className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_2fr]">
									<label className="text-[12.5px] text-white/60">
										Spend at least ₹
										<input
											name={`tierMin::${i}`}
											type="number"
											min={0}
											defaultValue={t?.min ?? ""}
											className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-white outline-none focus:border-brand"
										/>
									</label>
									<label className="text-[12.5px] text-white/60">
										Extra % off
										<input
											name={`tierExtra::${i}`}
											type="number"
											min={0}
											defaultValue={t?.extra ?? ""}
											className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-white outline-none focus:border-brand"
										/>
									</label>
									<label className="text-[12.5px] text-white/60">
										Label (blank = auto)
										<input
											name={`tierLabel::${i}`}
											defaultValue={t?.label ?? ""}
											className="mt-1 w-full rounded border border-white/20 bg-white/5 px-2 py-1.5 text-white outline-none focus:border-brand"
										/>
									</label>
								</div>
							);
						})}
					</div>
				</Section>

				<Section title="Social links (blank = hidden)">
					<Field name="instagram" label="Instagram URL" def={s.instagram} />
					<Field name="facebook" label="Facebook URL" def={s.facebook} />
					<Field name="youtube" label="YouTube URL" def={s.youtube} />
				</Section>

				<Section title="About-page story">
					<div className="sm:col-span-2">
						<label className="block text-[13px] text-white/70">
							Your story (leave a blank line between paragraphs)
							<textarea
								name="aboutStory"
								defaultValue={s.aboutStory}
								rows={8}
								className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
							/>
						</label>
					</div>
				</Section>

				<Section title="Announcement bar (scrolling text under the hero)">
					<div className="sm:col-span-2">
						<Field
							name="announcement"
							label="Announcement message (e.g. season / offer)"
							def={s.announcement}
						/>
					</div>
				</Section>

				<Section title="Branding & SEO">
					<div className="sm:col-span-2">
						<ImageInput name="logo" label="Logo (upload)" defaultValue={s.logo} />
					</div>
					<Field name="metaTitle" label="SEO title" def={s.metaTitle} />
					<div className="sm:col-span-2">
						<label className="block text-[13px] text-white/70">
							SEO description
							<textarea
								name="metaDescription"
								defaultValue={s.metaDescription}
								rows={2}
								className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
							/>
						</label>
					</div>
				</Section>

				<button className="rounded bg-brand px-6 py-2.5 font-semibold text-white hover:brightness-110">
					Save settings
				</button>
			</form>
		</div>
	);
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<section className="rounded border border-white/10 bg-white/5 p-4">
			<h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-white/50">
				{title}
			</h2>
			<div className="grid gap-3 sm:grid-cols-2">{children}</div>
		</section>
	);
}

function Field({
	name,
	label,
	def,
	type = "text",
}: {
	name: string;
	label: string;
	def: string;
	type?: string;
}) {
	return (
		<label className="block text-[13px] text-white/70">
			{label}
			<input
				name={name}
				type={type}
				defaultValue={def}
				className="mt-1 w-full rounded border border-white/20 bg-white/5 px-3 py-2 text-white outline-none focus:border-brand"
			/>
		</label>
	);
}
