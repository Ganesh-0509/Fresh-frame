import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** XML sitemap — submit this to Google Search Console + Bing Webmaster Tools. */
export default function sitemap(): MetadataRoute.Sitemap {
	const pages: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
		{ path: "/", priority: 1.0, freq: "daily" },
		{ path: "/products", priority: 0.9, freq: "daily" },
		{ path: "/about", priority: 0.6, freq: "monthly" },
		{ path: "/faq", priority: 0.6, freq: "monthly" },
		{ path: "/contact", priority: 0.7, freq: "monthly" },
	];
	return pages.map((p) => ({
		url: absoluteUrl(p.path),
		lastModified: new Date(),
		changeFrequency: p.freq,
		priority: p.priority,
	}));
}
