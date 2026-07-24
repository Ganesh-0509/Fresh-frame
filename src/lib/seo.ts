/**
 * SEO helpers — target keywords, canonical URL builder, and JSON-LD schema
 * builders (LocalBusiness, WebSite, FAQ, Breadcrumbs). Kept in one place so the
 * whole site's structured data stays consistent and easy to update.
 *
 * Ranking strategy: this is a LOCAL firecracker dealer (Sivakasi stock, sold to
 * Chennai + South India). We rank on local + product + seasonal intent, not on
 * "buy online" (illegal for crackers — the site is enquiry/price-list only).
 */

import { SITE, type PublicSite } from "@/lib/site";

/** Primary + secondary keywords we target across the site. */
export const SEO_KEYWORDS = [
	"Sivakasi crackers",
	"Sivakasi crackers Chennai",
	"crackers wholesale Chennai",
	"crackers price list 2026",
	"Standard Fireworks Sivakasi",
	"Diwali crackers Chennai",
	"Deepavali crackers Sivakasi",
	"buy crackers online Chennai",
	"crackers gift box Sivakasi",
	"wholesale crackers price list",
	"green crackers Chennai",
	"fireworks Chennai",
	"crackers dealer Chennai",
	"crackers direct from Sivakasi",
	"Sivakasi crackers online price list",
];

/** Approx storefront location (Chennai) — matches the visible address. */
export const SITE_GEO = { latitude: 13.0827, longitude: 80.2707 };

/** Build an absolute URL on the live domain (for canonical + sitemap + schema). */
export function absoluteUrl(path = "/"): string {
	const base = SITE.domain.replace(/\/$/, "");
	return path === "/" ? base : `${base}${path.startsWith("/") ? path : "/" + path}`;
}

/** LocalBusiness / Store schema — the single biggest local-SEO signal. */
export function localBusinessJsonLd(s: PublicSite) {
	return {
		"@context": "https://schema.org",
		"@type": "Store",
		"@id": absoluteUrl("/") + "#store",
		name: SITE.name,
		alternateName: s.legalName || undefined,
		description:
			"Sivakasi crackers dealer selling direct at wholesale rates to families across Chennai and South India. Enquiry and price list only — no online payment.",
		url: absoluteUrl("/"),
		telephone: s.phone,
		email: s.email,
		image: absoluteUrl("/brand-logo.png"),
		logo: absoluteUrl("/brand-logo.png"),
		priceRange: "₹₹",
		address: {
			"@type": "PostalAddress",
			streetAddress: s.addressLine,
			addressLocality: "Chennai",
			addressRegion: "Tamil Nadu",
			addressCountry: "IN",
		},
		geo: {
			"@type": "GeoCoordinates",
			latitude: SITE_GEO.latitude,
			longitude: SITE_GEO.longitude,
		},
		openingHoursSpecification: [
			{
				"@type": "OpeningHoursSpecification",
				dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
				opens: "10:00",
				closes: "20:00",
			},
		],
		areaServed: s.serviceStates.map((st) => ({ "@type": "State", name: st })),
		sameAs: [s.instagram, s.facebook, s.youtube].filter(Boolean),
	};
}

/** WebSite schema — helps search engines understand the site + name. */
export function websiteJsonLd() {
	return {
		"@context": "https://schema.org",
		"@type": "WebSite",
		"@id": absoluteUrl("/") + "#website",
		name: SITE.name,
		url: absoluteUrl("/"),
		inLanguage: "en-IN",
	};
}

/** FAQPage schema — can win the expandable FAQ rich result on Google/Bing. */
export function faqJsonLd(items: { q: string; a: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: items.map((it) => ({
			"@type": "Question",
			name: it.q,
			acceptedAnswer: { "@type": "Answer", text: it.a },
		})),
	};
}

/** BreadcrumbList schema for an inner page. */
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
	return {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: trail.map((t, i) => ({
			"@type": "ListItem",
			position: i + 1,
			name: t.name,
			item: absoluteUrl(t.path),
		})),
	};
}
