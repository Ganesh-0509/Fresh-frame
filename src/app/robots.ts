import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * robots.txt — let search engines crawl everything except the admin + API.
 *
 * While `SITE.pricesAreProvisional` is true the catalogue holds placeholder
 * prices, so the whole site is closed to crawlers: a cracker price list Google
 * has cached with invented rates is far worse than one it hasn't found yet.
 * Flip that flag when the client's real prices land and this opens up again.
 */
export default function robots(): MetadataRoute.Robots {
	if (SITE.pricesAreProvisional) {
		return { rules: [{ userAgent: "*", disallow: "/" }] };
	}
	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: ["/admin", "/admin/", "/api/"],
			},
		],
		sitemap: absoluteUrl("/sitemap.xml"),
		host: absoluteUrl("/"),
	};
}
