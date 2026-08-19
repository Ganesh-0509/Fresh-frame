import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		// Default is 1MB — too small for the price-list PDF upload
		// (admin → Settings), which is sent as a Server Action.
		serverActions: { bodySizeLimit: "2mb" },
	},
};

export default nextConfig;

// Enable calling `getCloudflareContext()` in `next dev`.
// See https://opennext.js.org/cloudflare/bindings#local-access-to-bindings.
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
initOpenNextCloudflareForDev();
