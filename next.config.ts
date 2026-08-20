import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		// Default is 1MB — too small for the price-list PDF upload
		// (admin → Settings), which is sent as a Server Action.
		serverActions: { bodySizeLimit: "2mb" },
	},
	// Canonicalize on the apex domain. `standardfireworkssivakasi.com` and
	// `www.standardfireworkssivakasi.com` are both wired as Cloudflare custom
	// domains to this same Worker with no redirect between them — Search
	// Console was indexing every page twice, once per host (2026-08-19 SEO
	// audit). A `proxy.ts` (Next 16's renamed Middleware) can't do this: as of
	// Next 16 it defaults to the Node.js runtime and its `runtime` config
	// option can't be overridden, but OpenNext's Cloudflare adapter only
	// supports Edge-runtime proxy — confirmed by a real local preview build
	// failing with "Node.js middleware is not currently supported." This
	// `redirects()` config is resolved into the routing manifest at build
	// time instead, so it needs no runtime at all.
	async redirects() {
		return [
			{
				source: "/:path*",
				has: [{ type: "host", value: "www.standardfireworkssivakasi.com" }],
				destination: "https://standardfireworkssivakasi.com/:path*",
				permanent: true,
			},
		];
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
