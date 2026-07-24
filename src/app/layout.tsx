import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicOnly from "@/components/PublicOnly";
import WelcomePopup from "@/components/WelcomePopup";
import { CartProvider } from "@/lib/cart";
import { SITE, publicSite } from "@/lib/site";
import { getSettings } from "@/lib/catalog";
import JsonLd from "@/components/JsonLd";
import { SEO_KEYWORDS, localBusinessJsonLd, websiteJsonLd } from "@/lib/seo";

const rubik = Rubik({
	variable: "--font-rubik",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
	const s = await getSettings();
	const title = s.metaTitle || `${SITE.name} — Sivakasi Crackers Wholesale Price List, Chennai`;
	return {
		metadataBase: new URL(SITE.domain),
		title: {
			default: title,
			template: `%s — ${SITE.name}`,
		},
		description: s.metaDescription,
		keywords: SEO_KEYWORDS,
		applicationName: SITE.name,
		alternates: { canonical: "/" },
		openGraph: {
			type: "website",
			locale: "en_IN",
			siteName: SITE.name,
			url: SITE.domain,
			title,
			description: s.metaDescription,
			images: [{ url: "/brand-logo.png", width: 411, height: 108, alt: SITE.name }],
		},
		twitter: {
			card: "summary",
			title,
			description: s.metaDescription,
			images: ["/brand-logo.png"],
		},
		robots: {
			index: true,
			follow: true,
			googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
		},
		verification: {
			google: SITE.googleVerification || undefined,
			other: SITE.bingVerification ? { "msvalidate.01": SITE.bingVerification } : {},
		},
		category: "shopping",
	};
}

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const site = publicSite(await getSettings());
	return (
		<html lang="en" className={rubik.variable}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<JsonLd data={localBusinessJsonLd(site)} />
				<JsonLd data={websiteJsonLd()} />
				<CartProvider>
					<PublicOnly>
						<Header site={site} />
					</PublicOnly>
					<main className="flex-1">{children}</main>
					<PublicOnly>
						<Footer site={site} />
						<WelcomePopup site={site} />
					</PublicOnly>
				</CartProvider>
			</body>
		</html>
	);
}
