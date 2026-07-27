import { SITE } from "@/lib/site";

/**
 * Shown on every page that quotes money while `SITE.pricesAreProvisional` is true.
 *
 * The catalogue currently holds generated placeholder prices so the order flow and
 * the spend-more-save-more slabs can be demoed and tested. Without this notice a
 * real customer could place a real order at an invented rate — the owner would
 * then either honour a price he never set or start the call with an argument.
 *
 * Renders nothing once the flag is off, so it costs nothing to leave in place.
 */
export default function ProvisionalPriceNotice() {
	if (!SITE.pricesAreProvisional) return null;
	return (
		<div className="border-y border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-[14px] font-medium text-amber-900">
			⚠️ Prices shown are <strong>indicative samples</strong> while we finalise this
			season&apos;s rate list. Please confirm the final rate on WhatsApp or by phone
			before paying.
		</div>
	);
}
