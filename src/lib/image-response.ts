import { NextResponse } from "next/server";

/**
 * Turn a stored data URL into a real image response.
 *
 * Every owner-uploaded picture (product, category, logo, About, banner) lives in D1
 * as a data URL, but is served through a URL instead of being inlined in the HTML —
 * otherwise a page with 182 products would carry megabytes of base64. Each URL
 * carries ?v=<version>, which changes whenever the picture is replaced, so the
 * response can be cached hard and still update instantly.
 */
export function dataUrlResponse(dataUrl: string | null): NextResponse {
	if (!dataUrl) return new NextResponse("Not found", { status: 404 });

	const m = /^data:([^;,]+);base64,(.*)$/s.exec(dataUrl);
	if (!m) return new NextResponse("Not found", { status: 404 });
	const [, mime, b64] = m;

	const bin = Buffer.from(b64, "base64");
	return new NextResponse(new Uint8Array(bin), {
		headers: {
			"Content-Type": mime,
			"Content-Length": String(bin.length),
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
