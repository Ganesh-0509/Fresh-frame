"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/catalog";
import { emailConfigured, ownerEmail, sendEmail } from "@/lib/email";
import { SITE, areaKey, cleanMapUrl, type ServiceArea, type EmailTemplate } from "@/lib/site";
import { parseDeliveryCsv, parseDeliveryWorkbook, mergeDeliveryImport } from "@/lib/delivery-csv";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/db";

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

/**
 * Owner uploads their transport-agent Excel sheet (.xlsx/.xls) as-is, or a CSV
 * (hand-built or the "Download current list" export they edited), to add/update
 * states, cities and areas in bulk. Additive on top of whatever is already
 * saved — see mergeDeliveryImport(). Column names are matched by alias, so no
 * reformatting is needed — see the header comment in lib/delivery-csv.ts.
 */
export async function importDeliveryFileAction(formData: FormData) {
	await requireAdmin();
	const file = formData.get("deliveryFile");
	if (!(file instanceof File) || file.size === 0) {
		redirect("/admin/settings?import=empty#delivery");
	}
	const name = (file as File).name.toLowerCase();
	const rows = name.endsWith(".xlsx") || name.endsWith(".xls")
		? parseDeliveryWorkbook(await (file as File).arrayBuffer())
		: parseDeliveryCsv(await (file as File).text());
	if (!rows.length) {
		redirect("/admin/settings?import=badfile#delivery");
	}
	const cur = await getSettings();
	const merged = mergeDeliveryImport(cur, rows);
	await saveSettings({ ...cur, ...merged });
	revalidatePath("/checkout");
	revalidatePath("/admin/settings");
	redirect(`/admin/settings?import=${rows.length}#delivery`);
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

	// Level 3 — areas inside each city, from `area::<state>::<city>::<i>::name|map`.
	// The owner can add unlimited rows in the browser, so the slot numbers are
	// discovered from what was actually submitted rather than assumed. A row with
	// a blank name is dropped, which is also how the owner deletes an area. A city
	// that isn't in the submitted list any more (renamed/removed) loses its areas.
	const serviceAreas: Record<string, ServiceArea[]> = {};
	for (const st of serviceStates) {
		for (const city of serviceCities[st]) {
			const key = areaKey(st, city);
			const prev = cur.serviceAreas?.[key] ?? [];
			const prefix = `area::${key}::`;
			const suffix = "::name";
			const slots: number[] = [];
			for (const field of formData.keys()) {
				if (!field.startsWith(prefix) || !field.endsWith(suffix)) continue;
				const i = Number(field.slice(prefix.length, field.length - suffix.length));
				if (Number.isInteger(i) && i >= 0) slots.push(i);
			}
			slots.sort((a, b) => a - b);

			const rows: ServiceArea[] = [];
			for (const i of slots) {
				const name = s(`${prefix}${i}${suffix}`, "");
				// Skip blanks and repeats — two areas with the same name would give the
				// customer a dropdown with two identical options.
				if (!name || rows.some((r) => r.name.toLowerCase() === name.toLowerCase())) continue;
				rows.push({ name, mapUrl: cleanMapUrl(s(`${prefix}${i}::map`, "")) });
			}
			// A city rendered before this feature existed has no area fields at all —
			// keep whatever was saved rather than silently wiping it.
			if (rows.length) serviceAreas[key] = rows;
			else if (!slots.length && prev.length) serviceAreas[key] = prev;
		}
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

	// Customer email wording — a subject + a message per order status
	// (emailTplSubject::<status> / emailTpl::<status>). Either left blank →
	// falls back to the built-in default for that one, independently.
	const emailTemplates: Partial<Record<OrderStatus, EmailTemplate>> = {};
	for (const st of ORDER_STATUSES) {
		const subject = s(`emailTplSubject::${st}`, cur.emailTemplates[st]?.subject ?? "");
		const body = s(`emailTpl::${st}`, cur.emailTemplates[st]?.body ?? "");
		if (subject || body) emailTemplates[st] = { subject: subject || undefined, body: body || undefined };
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
		serviceAreas,
		gstPct: n("gstPct", cur.gstPct),
		requireUtr: formData.get("requireUtr") === "on",
		metaTitle: s("metaTitle", cur.metaTitle),
		metaDescription: s("metaDescription", cur.metaDescription),
		logo: s("logo", cur.logo),
		announcement: s("announcement", cur.announcement),
		festivalName: s("festivalName", cur.festivalName),
		festivalDate: s("festivalDate", cur.festivalDate),

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
		emailTemplates,
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
