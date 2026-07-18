import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SideBar from "@/components/SideBar";
import PublicOnly from "@/components/PublicOnly";
import { CartProvider } from "@/lib/cart";
import { SITE } from "@/lib/site";
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

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={rubik.variable}>
			<head>
				<link rel="icon" href="/favicon.svg" type="image/svg+xml"></link>
			</head>
			<body className="flex min-h-screen flex-col antialiased">
				<CartProvider>
					<PublicOnly>
						<Header />
						<SideBar />
					</PublicOnly>
					{/* Bottom padding on mobile so the fixed bottom action bar never covers content. */}
					<main className="flex-1 pb-16 lg:pb-0">{children}</main>
					<PublicOnly>
						<Footer />
					</PublicOnly>
				</CartProvider>
			</body>
		</html>
	);
}
