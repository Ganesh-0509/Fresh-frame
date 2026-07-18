"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { SITE, telLink, waLink } from "@/lib/site";
import { WhatsAppIcon, PhoneIcon, MailIcon } from "@/components/icons";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About Us" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact Us" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    // NOTE: <header> deliberately does NOT wrap the <nav> below.
    // position:sticky is confined to its parent's box, so a sticky nav inside
    // this header would scroll away with it. Keeping them siblings makes the
    // nav's containing block the page, so it sticks for real.
    <>
      <header>
      {/* ---- utility bar ---- */}
      <div className="bg-brand-deep text-white text-[13px]">
        <div className="mx-auto flex max-w-[1170px] flex-wrap items-center justify-between gap-2 px-4 py-1.5">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <a href={telLink()} className="inline-flex items-center gap-1.5 hover:text-yellow">
              <PhoneIcon className="h-3.5 w-3.5" /> {SITE.phone}
            </a>
            <a
              href={`mailto:${SITE.email}`}
              className="hidden items-center gap-1.5 hover:text-yellow sm:inline-flex"
            >
              <MailIcon className="h-3.5 w-3.5" /> {SITE.email}
            </a>
            <span className="hidden font-medium tracking-wide opacity-80 md:inline">
              {SITE.shortName}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/products" className="btn-outline">
              Price List
            </Link>
            <a
              href={waLink(`Hi ${SITE.name}, I'd like to place an order.`)}
              target="_blank"
              rel="noopener"
              className="btn-yellow px-3! py-1! text-[13px]!"
            >
              ORDER NOW
            </a>
          </div>
        </div>
      </div>

      {/* ---- brand bar ---- */}
      <div className="bg-brand-dark">
        <div className="mx-auto flex max-w-[1170px] items-center gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-3">
            {/* Real Standard Fireworks wordmark. On a white chip so the red letters
                stay crisp against the dark-red bar. */}
            <span className="flex-none rounded bg-white px-2 py-1 shadow-sm">
              <Image
                src="/brand-logo.png"
                alt="Standard Fireworks"
                width={411}
                height={108}
                priority
                className="h-9 w-auto sm:h-10"
              />
            </span>
            <span className="leading-tight">
              <span className="block text-[13px] font-semibold tracking-[0.25em] text-yellow">
                SIVAKASI · AVADI
              </span>
              <span className="block text-[11px] tracking-wide text-white/70">
                Wholesale crackers, delivered
              </span>
            </span>
          </Link>
        </div>
      </div>

      </header>

      {/* ---- nav ----
          h-11 (44px) is fixed on purpose at every breakpoint: the sticky totals
          bar on /products offsets against it, and a nav that changes height
          between desktop and mobile silently buries that bar. */}
      <nav className="sticky top-0 z-50 bg-nav shadow-sm">
        <div className="mx-auto flex h-11 max-w-[1170px] items-center justify-between px-4">
          <ul className="hidden h-full md:flex">
            {NAV.map((n) => {
              const active = pathname === n.href;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    className={`flex h-full items-center px-4 text-[15px] font-medium transition-colors ${
                      active
                        ? "bg-brand text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* mobile */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label="Toggle menu"
            className="px-2 text-2xl leading-none text-white md:hidden"
          >
            {open ? "×" : "☰"}
          </button>
          <a
            href={waLink(`Hi ${SITE.name}, I'd like to enquire.`)}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 py-2 text-[14px] font-semibold text-yellow md:hidden"
          >
            <WhatsAppIcon className="h-4 w-4" /> WhatsApp
          </a>
        </div>

        {open && (
          <ul className="absolute inset-x-0 top-11 border-t border-white/10 bg-nav shadow-lg md:hidden">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className={`block border-b border-white/5 px-4 py-3 text-sm ${
                    pathname === n.href ? "bg-brand text-white" : "text-white/85"
                  }`}
                >
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </>
  );
}
