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

const rubik = Rubik({
	variable: "--font-rubik",
	subsets: ["latin"],
	weight: ["300", "400", "500", "600", "700"],
	display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
	const s = await getSettings();
	return {
		metadataBase: new URL(SITE.domain),
		title: {
			default: s.metaTitle || `${SITE.name} — Crackers Direct from Sivakasi`,
			template: `%s — ${SITE.name}`,
		},
		description: s.metaDescription,
		openGraph: { type: "website", locale: "en_IN", siteName: SITE.name },
		robots: { index: true, follow: true },
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
