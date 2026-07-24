"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/catalog";
import { emailConfigured, ownerEmail, sendEmail } from "@/lib/email";
import { SITE } from "@/lib/site";

/** Owner clicks "Send test email" — proves the email integration works. */
export async function sendTestEmailAction() {
	await requireAdmin();
	if (!emailConfigured()) {
		redirect("/admin/settings?test=unconfigured");
	}
	const to = ownerEmail();
	const ok = await sendEmail({
		to,
		subject: `✅ ${SITE.name} — test email`,
		text:
			"This is a test from your admin panel.\n\n" +
			"If you're reading this, email notifications are working — new orders and order-status " +
			"updates will send automatically.\n\n— Sent from Admin → Settings",
	});
	redirect(`/admin/settings?test=${ok ? "ok" : "fail"}`);
}

export async function saveSettingsAction(formData: FormData) {
	await requireAdmin();
	const cur = await getSettings();
	const s = (k: string, d: string) => {
		const v = formData.get(k);
		return v === null ? d : String(v).trim();
	};
	const n = (k: string, d: number) => {
		const v = Number(formData.get(k));
		return Number.isFinite(v) && v >= 0 ? Math.floor(v) : d;
	};
	const serviceStates = s("serviceStates", cur.serviceStates.join(", "))
		.split(",")
		.map((x) => x.trim())
		.filter(Boolean);

	// Per-state transport fee + serviceable cities come from `fee::<state>` /
	// `cities::<state>` fields, keyed to the current state list.
	const transportFees: Record<string, number> = {};
	const serviceCities: Record<string, string[]> = {};
	for (const st of serviceStates) {
		transportFees[st] = n(`fee::${st}`, cur.transportFees[st] ?? 0);
		serviceCities[st] = s(`cities::${st}`, (cur.serviceCities[st] ?? []).join(", "))
			.split(",")
			.map((x) => x.trim())
			.filter(Boolean);
	}

	// Discount tiers — up to 4 rows (tierMin::i / tierExtra::i / tierLabel::i).
	// A row counts only if it has a positive spend threshold.
	const discountTiers = [];
	for (let i = 0; i < 4; i++) {
		const min = n(`tierMin::${i}`, 0);
		const extra = n(`tierExtra::${i}`, 0);
		const label = s(`tierLabel::${i}`, "");
		if (min > 0) {
			discountTiers.push({ min, extra, label: label || `Spend ₹${min.toLocaleString("en-IN")}+` });
		}
	}

	await saveSettings({
		phone: s("phone", cur.phone),
		whatsapp: s("whatsapp", cur.whatsapp).replace(/\D/g, ""),
		email: s("email", cur.email),
		upi: s("upi", cur.upi),
		upiQr: s("upiQr", cur.upiQr),
		minOrder: n("minOrder", cur.minOrder),
		discountPct: n("discountPct", cur.discountPct),
		bankName: s("bankName", cur.bankName),
		bankBranch: s("bankBranch", cur.bankBranch),
		bankAccount: s("bankAccount", cur.bankAccount),
		bankIfsc: s("bankIfsc", cur.bankIfsc),
		bankHolder: s("bankHolder", cur.bankHolder),
		serviceStates,
		transportFees,
		serviceCities,
		gstPct: n("gstPct", cur.gstPct),
		requireUtr: formData.get("requireUtr") === "on",
		metaTitle: s("metaTitle", cur.metaTitle),
		metaDescription: s("metaDescription", cur.metaDescription),
		logo: s("logo", cur.logo),
		announcement: s("announcement", cur.announcement),

		// content / identity
		tagline: s("tagline", cur.tagline),
		hours: s("hours", cur.hours),
		addressLine: s("addressLine", cur.addressLine),
		legalName: s("legalName", cur.legalName),
		gstNumber: s("gstNumber", cur.gstNumber),
		licence: s("licence", cur.licence),
		stockistOf: s("stockistOf", cur.stockistOf),
		aboutStory: s("aboutStory", cur.aboutStory),
		discountTiers: discountTiers.length ? discountTiers : cur.discountTiers,
		facebook: s("facebook", cur.facebook),
		instagram: s("instagram", cur.instagram),
		youtube: s("youtube", cur.youtube),
	});
	revalidatePath("/", "layout"); // header/footer live on every page
	revalidatePath("/");
	revalidatePath("/about");
	revalidatePath("/faq");
	revalidatePath("/contact");
	revalidatePath("/checkout");
	revalidatePath("/products");
	revalidatePath("/admin/settings");
	redirect("/admin/settings?saved=1");
}
