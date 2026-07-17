import Link from "next/link";
import { SITE, money, telLink } from "@/lib/site";
import { CATEGORIES } from "@/lib/catalogue";

export default function Footer() {
  return (
    <footer>
      {/* ---- payment / bank band ---- */}
      <div className="bg-brand-dark text-white">
        <div className="mx-auto max-w-[1170px] px-4 py-10">
          <h3 className="mb-5 border-b border-white/25 pb-2 text-lg font-semibold">
            Bank Details For Payment
          </h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="text-[15px] leading-7 text-white/90">
              <p>{SITE.bank.holder}</p>
              <p>{SITE.bank.name}</p>
              <p>{SITE.bank.branch}</p>
              <p>A/c: {SITE.bank.account}</p>
              <p>IFSC: {SITE.bank.ifsc}</p>
              <p className="mt-3 text-[14px] text-yellow">
                Payment is arranged after we confirm your order by phone.
              </p>
            </div>
            <div>
              <p className="mb-2 text-[15px] font-semibold">Pay Online</p>
              <div className="grid h-32 w-32 place-items-center border border-white/25 bg-white/10 text-center text-[13px] leading-4 text-white/60">
                UPI QR
                <br />
                placeholder
              </div>
              <p className="mt-2 text-[14px] text-white/85">
                Google Pay / Paytm / PhonePe: {SITE.phone}
              </p>
              <p className="mt-1 text-[13px] text-white/60">
                Cash on delivery is not available.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ---- link columns ---- */}
      <div className="bg-brand text-white">
        <div className="mx-auto grid max-w-[1170px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h4 className="mb-3 border-b-2 border-yellow pb-1 text-sm font-semibold">
              About Us
            </h4>
            <p className="text-[14.5px] leading-6 text-white/90">
              A Sivakasi family in the cracker trade. We buy wholesale here and sell
              direct — no showroom, no middlemen, no commission.
            </p>
            <a
              href={telLink()}
              className="mt-3 inline-block bg-white/15 px-3 py-2 text-[14px] font-semibold"
            >
              FOR QUERIES: {SITE.phone}
            </a>
          </div>

          <div>
            <h4 className="mb-3 border-b-2 border-yellow pb-1 text-sm font-semibold">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-[14.5px] text-white/90">
              {[
                ["/about", "About us"],
                ["/products", "Products"],
                ["/gallery", "Gallery"],
                ["/faq", "FAQ"],
                ["/contact", "Contact us"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="hover:text-yellow">
                    / {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 border-b-2 border-yellow pb-1 text-sm font-semibold">
              Categories
            </h4>
            <ul className="space-y-1.5 text-[14.5px] text-white/90">
              {CATEGORIES.map((c) => (
                <li key={c.id}>
                  <Link href={`/products#${c.id}`} className="hover:text-yellow">
                    / {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 border-b-2 border-yellow pb-1 text-sm font-semibold">
              Contact Information
            </h4>
            <address className="space-y-1.5 text-[14.5px] not-italic leading-6 text-white/90">
              <p>📍 {SITE.name}</p>
              <p>{SITE.address.line1}</p>
              <p>{SITE.address.line2}</p>
              <p>{SITE.address.line3}</p>
              <p>
                📞{" "}
                <a href={telLink()} className="hover:text-yellow">
                  {SITE.phone}
                </a>
              </p>
              <p>
                ✉️{" "}
                <a href={`mailto:${SITE.email}`} className="hover:text-yellow">
                  {SITE.email}
                </a>
              </p>
              {SITE.gst && <p>🧾 GSTIN: {SITE.gst}</p>}
              {SITE.licence && <p>🛡️ Licence: {SITE.licence}</p>}
            </address>
          </div>
        </div>
      </div>

      {/* ---- legal ---- */}
      <div className="bg-[#1c1c1c] text-white/70">
        <div className="mx-auto max-w-[1170px] px-4 py-5 text-[13px] leading-5">
          <p className="mb-2">
            <strong className="text-white/90">Please note:</strong> Sale and use of
            firecrackers in India is regulated by orders of the Hon&apos;ble Supreme Court
            and by the Explosives Act, 1884 / Explosives Rules, 2008.{" "}
            <strong className="text-white/90">
              This website does not sell crackers online and does not accept online
              payment.
            </strong>{" "}
            The price list is for enquiry only — we confirm availability and the final
            estimate by phone, and payment is completed offline. Delivery is by goods
            transport to your nearest transport office; crackers cannot legally be sent by
            courier or post. We do not deliver to Delhi-NCR or to any state where sale is
            banned. Minimum order {money(SITE.minOrder)}.
          </p>
          <div className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3">
            <span>
              © {new Date().getFullYear()} {SITE.name}
              {SITE.legalName ? ` (${SITE.legalName})` : ""}. All rights reserved.
            </span>
            <span>Site by Fresh Frame — we build, you grow.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
