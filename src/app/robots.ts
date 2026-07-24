import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/** robots.txt — let search engines crawl everything except the admin + API. */
export default function robots(): MetadataRoute.Robots {
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
