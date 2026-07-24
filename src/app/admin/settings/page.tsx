import { requireAdmin } from "@/lib/admin-auth";
import { getSettings } from "@/lib/catalog";
import { emailConfigured, ownerEmail } from "@/lib/email";
import { saveSettingsAction, sendTestEmailAction } from "./actions";
import ImageInput from "./ImageInput";
import { aCard, aCardTitle, aCardSub, aLabel, aHint, aInput, aBtn, aBtnGhost, aPageTitle, aSuccess } from "@/lib/admin-ui";

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
			<h1 className={aPageTitle}>Settings</h1>
			<p className="mb-6 mt-1 text-[15px] text-muted">
				Everything here shows on your website. Change anything, then press{" "}
				<b>Save changes</b> at the bottom — it goes live straight away.
			</p>

			{saved && <p className={aSuccess}>✓ Saved! Your website is updated.</p>}

			{/* ---- Automatic emails (Resend) ---- */}
			<div className={`mb-6 ${aCard}`}>
				<h2 className={aCardTitle}>✉️ Automatic emails</h2>
				<p className={aCardSub}>
					When this is on, you get an email for every new order, and customers get an
					email when you update their order.
				</p>
				<div className="flex flex-wrap items-center gap-2">
					<span className={`h-3 w-3 rounded-full ${mail ? "bg-emerald-500" : "bg-gray-300"}`} />
					<span className="text-[15px] font-bold text-ink">{mail ? "On" : "Off"}</span>
					<span className="text-[14px] text-muted">
						{mail
							? `— alerts go to ${inbox}.`
							: "— not set up yet. Ask your developer to switch it on (needs a Resend key)."}
					</span>
				</div>

				{test === "ok" && (
					<p className="mt-3 rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-[14px] text-emerald-800">
						✓ Test email sent to {inbox}. Check that inbox (and spam) — if it arrived, emails work.
					</p>
				)}
				{test === "fail" && (
					<p className="mt-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[14px] text-red-700">
						✕ Couldn&apos;t send. The email setup needs attention — tell your developer.
					</p>
				)}
				{test === "unconfigured" && (
					<p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[14px] text-amber-800">
						Emails aren&apos;t switched on yet.
					</p>
				)}

				<form action={sendTestEmailAction} className="mt-3">
					<button className={aBtnGhost}>Send a test email</button>
				</form>
			</div>

			<form action={saveSettingsAction} className="space-y-6">
				<Card icon="💰" title="Payment details" sub="How customers pay you after you confirm their order.">
					<Field name="upi" label="Your UPI ID" def={s.upi} hint="Customers pay here on Google Pay / PhonePe / Paytm. Example: yourname@okhdfc" />
					<div className="sm:col-span-2">
						<ImageInput name="upiQr" label="UPI QR code photo" defaultValue={s.upiQr} />
						<p className={aHint}>Upload a photo of your QR code — customers scan it to pay you.</p>
					</div>
					<Field name="bankHolder" label="Bank account holder name" def={s.bankHolder} />
					<Field name="bankName" label="Bank name" def={s.bankName} />
					<Field name="bankBranch" label="Branch" def={s.bankBranch} />
					<Field name="bankAccount" label="Account number" def={s.bankAccount} />
					<Field name="bankIfsc" label="IFSC code" def={s.bankIfsc} hint="The 11-character code in your passbook / cheque book." />
				</Card>

				<Card icon="📞" title="Contact details" sub="Shown in the header, footer and contact page.">
					<Field name="phone" label="Phone number" def={s.phone} hint="Customers call this. Also your Google Pay number." />
					<Field name="whatsapp" label="WhatsApp number" def={s.whatsapp} hint="Digits only with country code, e.g. 919344170018." />
					<Field name="email" label="Email address" def={s.email} />
				</Card>

				<Card icon="💵" title="Prices & delivery" sub="The basic rules for orders.">
					<Field name="minOrder" label="Smallest order you accept (₹)" def={String(s.minOrder)} type="number" hint="Customers can't order for less than this." />
					<Field name="discountPct" label="Main discount shown on the site (%)" def={String(s.discountPct)} type="number" hint="The big number customers see, e.g. 50." />
					<Field name="gstPct" label="GST tax %" def={String(s.gstPct)} type="number" hint="Leave 0 if you don't add GST to your bills." />
					<label className="flex items-start gap-2.5 text-[15px] text-ink sm:col-span-2">
						<input type="checkbox" name="requireUtr" defaultChecked={s.requireUtr} className="mt-1 h-5 w-5 accent-[var(--color-brand)]" />
						<span>
							Ask customers for their payment reference number
							<span className="mt-0.5 block text-[13.5px] text-muted">
								The UTR / transaction number from their payment — makes it easy to match who paid.
							</span>
						</span>
					</label>
					<div className="sm:col-span-2">
						<label className={aLabel}>States you deliver to</label>
						<textarea
							name="serviceStates"
							defaultValue={s.serviceStates.join(", ")}
							rows={2}
							className={aInput}
						/>
						<p className={aHint}>Separate each state with a comma. Add or remove one, press Save, then set its delivery charge below.</p>
					</div>
				</Card>

				<Card icon="🚚" title="Delivery charge & cities" sub="Set what you charge for transport, and which cities you serve, per state.">
					<div className="space-y-3 sm:col-span-2">
						<p className="text-[14px] text-muted">
							The delivery charge is added automatically at checkout. Customers can only pick
							a city you list here — so they can&apos;t order to a place you don&apos;t serve.
						</p>
						{s.serviceStates.map((st) => (
							<div key={st} className="rounded-xl border border-line bg-row p-3.5">
								<div className="mb-2 flex flex-wrap items-center justify-between gap-3">
									<span className="text-[16px] font-bold text-ink">{st}</span>
									<label className="flex items-center gap-2 text-[14px] font-semibold text-ink">
										Delivery ₹
										<input
											name={`fee::${st}`}
											type="number"
											min={0}
											defaultValue={s.transportFees[st] ?? 0}
											className="w-28 rounded-lg border border-line bg-white px-3 py-2 text-[16px] text-ink outline-none focus:border-brand"
										/>
									</label>
								</div>
								<label className="block text-[14px] text-ink-soft">
									Cities you deliver to (separate with commas)
									<textarea
										name={`cities::${st}`}
										defaultValue={(s.serviceCities[st] ?? []).join(", ")}
										rows={2}
										className={aInput}
									/>
								</label>
							</div>
						))}
					</div>
				</Card>

				<Card icon="🏪" title="Your shop details" sub="Name, hours and address shown around the site.">
					<Field name="tagline" label="Short slogan" def={s.tagline} hint="One line under your shop name." />
					<Field name="hours" label="Opening hours" def={s.hours} />
					<Field name="addressLine" label="Address" def={s.addressLine} />
					<Field name="legalName" label="Registered / firm name" def={s.legalName} hint="Shown small in the footer." />
					<Field name="gstNumber" label="GST number" def={s.gstNumber} hint="Leave blank to hide it." />
					<Field name="licence" label="Explosives licence number" def={s.licence} hint="Leave blank to hide it." />
					<div className="sm:col-span-2">
						<Field name="stockistOf" label="Brand name to display" def={s.stockistOf} hint="Only if you're allowed to use it in writing. Leave blank to hide." />
					</div>
				</Card>

				<Card icon="🏷️" title="Buy more, save more offers" sub="Extra discount when a customer spends more. Leave a row blank to remove it.">
					<div className="space-y-2 sm:col-span-2">
						{[0, 1, 2, 3].map((i) => {
							const t = s.discountTiers[i];
							return (
								<div key={i} className="grid grid-cols-1 gap-2 rounded-xl border border-line bg-row p-3 sm:grid-cols-[1fr_1fr_2fr]">
									<label className="text-[14px] font-semibold text-ink-soft">
										When they spend at least ₹
										<input
											name={`tierMin::${i}`}
											type="number"
											min={0}
											defaultValue={t?.min ?? ""}
											className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[16px] text-ink outline-none focus:border-brand"
										/>
									</label>
									<label className="text-[14px] font-semibold text-ink-soft">
										Give extra % off
										<input
											name={`tierExtra::${i}`}
											type="number"
											min={0}
											defaultValue={t?.extra ?? ""}
											className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[16px] text-ink outline-none focus:border-brand"
										/>
									</label>
									<label className="text-[14px] font-semibold text-ink-soft">
										Label (leave blank for auto)
										<input
											name={`tierLabel::${i}`}
											defaultValue={t?.label ?? ""}
											className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-[16px] text-ink outline-none focus:border-brand"
										/>
									</label>
								</div>
							);
						})}
					</div>
				</Card>

				<Card icon="📣" title="Announcement banner" sub="The scrolling message under the top banner on the home page.">
					<div className="sm:col-span-2">
						<Field name="announcement" label="Announcement message" def={s.announcement} hint="e.g. your current offer or season." />
					</div>
				</Card>

				<Card icon="🔗" title="Social media links" sub="Leave blank to hide that icon.">
					<Field name="instagram" label="Instagram link" def={s.instagram} />
					<Field name="facebook" label="Facebook link" def={s.facebook} />
					<Field name="youtube" label="YouTube link" def={s.youtube} />
				</Card>

				<Card icon="📖" title="About your shop" sub="The story shown on the About page.">
					<div className="sm:col-span-2">
						<label className={aLabel}>Your story</label>
						<textarea name="aboutStory" defaultValue={s.aboutStory} rows={8} className={aInput} />
						<p className={aHint}>Leave one empty line between paragraphs.</p>
					</div>
				</Card>

				<Card icon="🖼️" title="Shop logo" sub="Shown in the top corner of your website.">
					<div className="sm:col-span-2">
						<ImageInput name="logo" label="Logo image" defaultValue={s.logo} />
					</div>
				</Card>

				{/* Advanced — techy stuff most owners never touch */}
				<details className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
					<summary className="cursor-pointer list-none text-[16px] font-bold text-ink-soft">
						⚙️ Advanced (optional) — how you appear on Google
						<span className="ml-2 text-[13px] font-normal text-muted">click to open</span>
					</summary>
					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<Field name="metaTitle" label="Google search title" def={s.metaTitle} />
						<div className="sm:col-span-2">
							<label className={aLabel}>Google search description</label>
							<textarea name="metaDescription" defaultValue={s.metaDescription} rows={2} className={aInput} />
						</div>
					</div>
				</details>

				<div className="sticky bottom-4 z-10 flex justify-center pt-2">
					<button className={aBtn}>✓ Save changes</button>
				</div>
			</form>
		</div>
	);
}

function Card({ icon, title, sub, children }: { icon: string; title: string; sub?: string; children: React.ReactNode }) {
	return (
		<section className={aCard}>
			<h2 className={aCardTitle}>
				<span aria-hidden>{icon}</span> {title}
			</h2>
			{sub && <p className={aCardSub}>{sub}</p>}
			<div className="grid gap-4 sm:grid-cols-2">{children}</div>
		</section>
	);
}

function Field({
	name,
	label,
	def,
	type = "text",
	hint,
}: {
	name: string;
	label: string;
	def: string;
	type?: string;
	hint?: string;
}) {
	return (
		<label className="block">
			<span className={aLabel}>{label}</span>
			<input name={name} type={type} defaultValue={def} className={aInput} />
			{hint && <span className={aHint}>{hint}</span>}
		</label>
	);
}
