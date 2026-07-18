"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import { getSettings, saveSettings } from "@/lib/catalog";

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
	});
	revalidatePath("/admin/settings");
	revalidatePath("/checkout");
	revalidatePath("/products");
	redirect("/admin/settings?saved=1");
}
