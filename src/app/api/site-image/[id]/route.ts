import { NextRequest } from "next/server";
import { getSiteImageData } from "@/lib/catalog";
import { dataUrlResponse } from "@/lib/image-response";

export const runtime = "nodejs";

/** Serve a logo / About / banner picture uploaded in /admin/photos. */
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
	const { id } = await ctx.params;
	return dataUrlResponse(await getSiteImageData(id));
}
