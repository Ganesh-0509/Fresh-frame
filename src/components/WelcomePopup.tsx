"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Modal from "@/components/Modal";
import Fireworks from "@/components/Fireworks";
import { SparkBurst, WhatsAppIcon } from "@/components/icons";
import { type PublicSite, money, waLinkTo } from "@/lib/site";

/**
 * Festive discount popup. Shows on EVERY page load, a short beat after load so
 * it doesn't fight the hero. Uses the same night-sky + fireworks animation as
 * the rest of the site.
 */
export default function WelcomePopup({ site }: { site: PublicSite }) {
	const [open, setOpen] = useState(false);

	useEffect(() => {
		const t = setTimeout(() => setOpen(true), 1400);
		return () => clearTimeout(t);
	}, []);

	const close = () => setOpen(false);

	return (
		<Modal open={open} onClose={close} labelledBy="welcome-title" maxWidth="max-w-md">
			<div className="night-bg relative overflow-hidden rounded-2xl border border-yellow/40 text-center text-white shadow-2xl">
				<Fireworks />
				<div className="relative z-10 px-6 py-9">
					<p className="text-[15px] font-semibold tracking-[0.3em] text-yellow">
						✦ DEEPAVALI 2026 ✦
					</p>
					<h2
						id="welcome-title"
						className="mt-2 text-5xl font-black leading-none"
					>
						<span className="gold-text">FLAT {site.discountPct}%</span>
						<span className="mt-1 block text-2xl font-extrabold text-white">
							OFF THE PRICE LIST
						</span>
					</h2>
					<p className="mx-auto mt-4 max-w-xs text-[15.5px] leading-6 text-white/85">
						Real Sivakasi crackers at wholesale rate — booking is open. Minimum order{" "}
						{money(site.minOrder)}.
					</p>

					<div className="mt-6 flex flex-col gap-3">
						<Link
							href="/products"
							onClick={close}
							className="btn-yellow shimmer w-full justify-center py-3 text-base"
						>
							<SparkBurst className="h-4 w-4" /> See the price list
						</Link>
						<a
							href={waLinkTo(site.whatsapp, `Hi ${site.name}, I saw the ${site.discountPct}% Deepavali offer — I'd like to enquire.`)}
							target="_blank"
							rel="noopener"
							onClick={close}
							className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#25D366] py-3 text-base font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
						>
							<WhatsAppIcon className="h-4 w-4" /> Enquire on WhatsApp
						</a>
					</div>

					<button
						onClick={close}
						className="mt-4 text-[13px] text-white/50 underline underline-offset-2 hover:text-white/80"
					>
						Maybe later
					</button>
				</div>
			</div>
		</Modal>
	);
}
