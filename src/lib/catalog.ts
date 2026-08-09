/**
 * Server-only catalogue + settings data access (D1).
 * Call these from server components / route handlers / server actions only.
 *
 * On first read, the catalogue auto-seeds from the real price list (seed-data.ts).
 * If D1 is unavailable, reads fall back to the seed so the site never breaks.
 */

import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { asc, eq } from "drizzle-orm";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { SEED_CATEGORIES, SEED_PRODUCTS } from "@/lib/seed-data";
import {
	type Catalog,
	type CatCategory,
	type CatProduct,
	type LineId,
	type SiteImage,
	type SiteImageGroup,
	productImageUrl,
	categoryImageUrl,
	siteImageUrl,
} from "@/lib/catalog-types";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/site";

export const categories = sqliteTable("categories", {
	id: text("id").primaryKey(),
	line: text("line").notNull(),
	name: text("name").notNull(),
	sort: integer("sort").notNull().default(0),
	// Same rules as products.image — never selected in bulk; served by /api/category-image.
	image: text("image").notNull().default(""),
	imageV: integer("image_v").notNull().default(0),
});

/** Logo / About / banner pictures. See catalog-types SITE_IMAGE_GROUPS. */
export const siteImages = sqliteTable("site_images", {
	id: text("id").primaryKey(),
	group: text("group_key").notNull(),
	data: text("data").notNull(),
	v: integer("v").notNull().default(1),
	caption: text("caption").notNull().default(""),
	sort: integer("sort").notNull().default(0),
});

export const products = sqliteTable("products", {
	id: text("id").primaryKey(),
	categoryId: text("category_id").notNull(),
	line: text("line").notNull(),
	name: text("name").notNull(),
	content: text("content").notNull().default(""),
	mrp: integer("mrp").notNull().default(0),
	price: integer("price").notNull().default(0),
	active: integer("active").notNull().default(1),
	stock: integer("stock").notNull().default(-1),
	sort: integer("sort").notNull().default(0),
	// Owner-uploaded photo as a data URL. NEVER selected by getCatalog — 182 products
	// worth of base64 would bloat every page. It is served by /api/product-image/<id>.
	image: text("image").notNull().default(""),
	// 0 = no photo. >0 = photo present; doubles as the cache-buster in the image URL.
	imageV: integer("image_v").notNull().default(0),
});

export const settingsTable = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

function db() {
	const { env } = getCloudflareContext();
	if (!env.DB) throw new Error("D1 binding 'DB' is not configured.");
	return drizzle(env.DB, { schema: { categories, products, settingsTable, siteImages } });
}

/* ---- DEMO PRICES (production: OFF) ----
 * During the demo phase, zero-priced products were auto-filled with plausible
 * numbers so the layout looked populated. For PRODUCTION this is OFF — we never
 * show a fabricated price to a real customer. A product with no price shows "—"
 * until the owner enters the real rate in /admin/products.
 * To temporarily re-enable the populated demo look, set DEMO_PRICES = true.
 */
const DEMO_PRICES = false;
function demoMrp(categoryId: string, id: string): number {
	const s = (categoryId + "|" + id).toLowerCase();
	let h = 0;
	for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
	const pick = (lo: number, hi: number, step: number) =>
		lo + (h % (Math.floor((hi - lo) / step) + 1)) * step;
	if (s.includes("sparkler") || s.includes("match")) return pick(30, 130, 10);
	if (s.includes("gift")) return pick(800, 3200, 100);
	if (
		s.includes("chakkar") || s.includes("flower") || s.includes("pot") ||
		s.includes("fountain") || s.includes("twink")
	)
		return pick(80, 320, 20);
	if (
		s.includes("rocket") || s.includes("bomb") || s.includes("sound") ||
		s.includes("comet") || s.includes("peacock")
	)
		return pick(120, 520, 20);
	if (
		s.includes("cake") || s.includes("multi") || s.includes("shot") ||
		s.includes("fancy") || s.includes("novel") || s.includes("night") ||
		s.includes("confetti") || s.includes("smoke")
	)
		return pick(300, 1900, 50);
	return pick(100, 620, 20);
}

/** Fill zero-priced products with demo prices (display only). No-op in production. */
function applyDemoPrices(prods: CatProduct[]): CatProduct[] {
	if (!DEMO_PRICES) return prods;
	return prods.map((p) => {
		if (p.price > 0 || p.mrp > 0) return p;
		const mrp = demoMrp(p.categoryId, p.id);
		return { ...p, mrp, price: Math.round((mrp * (100 - DEFAULT_SETTINGS.discountPct)) / 100) };
	});
}

/* ---- seed data as the fallback catalog ---- */
function seedCatalog(): Catalog {
	const cats: CatCategory[] = SEED_CATEGORIES.map((c) => ({
		id: c.id,
		line: c.line,
		name: c.name,
		image: "",
	}));
	const catLine = new Map(cats.map((c) => [c.id, c.line]));
	const prods: CatProduct[] = SEED_PRODUCTS.map((p) => ({
		id: p.id,
		categoryId: p.categoryId,
		line: (catLine.get(p.categoryId) ?? "standard") as LineId,
		name: p.name,
		content: p.content,
		mrp: p.mrp,
		price: p.price,
		active: true,
		stock: -1,
		image: "",
	}));
	return { categories: cats, products: applyDemoPrices(prods) };
}

/** Insert the seed rows if the products table is empty. */
async function ensureSeeded(d: ReturnType<typeof db>) {
	const existing = await d.select({ id: products.id }).from(products).limit(1);
	if (existing.length) return;
	const seed = seedCatalog();
	// D1 batch insert in chunks (avoid oversized statements).
	for (let i = 0; i < seed.categories.length; i++) {
		const c = seed.categories[i];
		await d.insert(categories).values({ id: c.id, line: c.line, name: c.name, sort: i });
	}
	for (let i = 0; i < seed.products.length; i++) {
		const p = seed.products[i];
		await d.insert(products).values({
			id: p.id,
			categoryId: p.categoryId,
			line: p.line,
			name: p.name,
			content: p.content,
			mrp: p.mrp,
			price: p.price,
			active: 1,
			sort: i,
		});
	}
}

export async function getCatalog(): Promise<Catalog> {
	try {
		const d = db();
		await ensureSeeded(d);
		const cats = await d
			.select({
				id: categories.id,
				line: categories.line,
				name: categories.name,
				imageV: categories.imageV,
			})
			.from(categories)
			.orderBy(asc(categories.sort));
		// Explicit column list — `image` (a base64 data URL) is deliberately excluded so
		// product photos never travel inside the page payload. See productImageUrl().
		const prods = await d
			.select({
				id: products.id,
				categoryId: products.categoryId,
				line: products.line,
				name: products.name,
				content: products.content,
				mrp: products.mrp,
				price: products.price,
				active: products.active,
				stock: products.stock,
				imageV: products.imageV,
			})
			.from(products)
			.orderBy(asc(products.sort));
		return {
			categories: cats.map((c) => ({
				id: c.id,
				line: c.line as LineId,
				name: c.name,
				image: categoryImageUrl(c.id, c.imageV),
			})),
			products: applyDemoPrices(
				prods.map((p) => ({
					id: p.id,
					categoryId: p.categoryId,
					line: p.line as LineId,
					name: p.name,
					content: p.content,
					mrp: p.mrp,
					price: p.price,
					active: p.active === 1,
					stock: p.stock,
					image: productImageUrl(p.id, p.imageV),
				})),
			),
		};
	} catch {
		return seedCatalog();
	}
}

/* ---- settings ---- */

export async function getSettings(): Promise<Settings> {
	try {
		const d = db();
		const rows = await d
			.select()
			.from(settingsTable)
			.where(eq(settingsTable.key, "site"))
			.limit(1);
		if (rows[0]) {
			return { ...DEFAULT_SETTINGS, ...(JSON.parse(rows[0].value) as Partial<Settings>) };
		}
	} catch {
		/* fall through to defaults */
	}
	return DEFAULT_SETTINGS;
}

export async function saveSettings(next: Settings): Promise<void> {
	const d = db();
	const value = JSON.stringify(next);
	const existing = await d
		.select({ key: settingsTable.key })
		.from(settingsTable)
		.where(eq(settingsTable.key, "site"))
		.limit(1);
	if (existing[0]) {
		await d.update(settingsTable).set({ value }).where(eq(settingsTable.key, "site"));
	} else {
		await d.insert(settingsTable).values({ key: "site", value });
	}
}

/* ---- product writes (admin) ---- */

export async function updateProduct(
	id: string,
	fields: Partial<Pick<CatProduct, "name" | "content" | "mrp" | "price" | "active" | "categoryId" | "stock">>,
): Promise<void> {
	const set: Record<string, unknown> = { ...fields };
	if (fields.active !== undefined) set.active = fields.active ? 1 : 0;
	await db().update(products).set(set).where(eq(products.id, id));
}

export async function deleteProduct(id: string): Promise<void> {
	await db().delete(products).where(eq(products.id, id));
}

/**
 * Persist a drag-and-drop reorder: `orderedIds` is every product currently
 * shown in that category, in the exact order the owner dropped them in.
 * Re-numbers `sort` as 0..N-1 to match — this also self-heals categories
 * where several products still share the old flat default of 9999. IDs not
 * belonging to `categoryId` are ignored (defensive — the UI never sends
 * these, but a product moved from under the browser between load and drop
 * shouldn't get reordered into a category it no longer belongs to).
 */
export async function reorderProducts(categoryId: string, orderedIds: string[]): Promise<void> {
	const d = db();
	const rows = await d
		.select({ id: products.id, categoryId: products.categoryId })
		.from(products)
		.where(eq(products.categoryId, categoryId));
	const valid = new Set(rows.map((r) => r.id));
	let k = 0;
	for (const id of orderedIds) {
		if (!valid.has(id)) continue;
		await d.update(products).set({ sort: k }).where(eq(products.id, id));
		k++;
	}
}

/* ---- product photos ----
 * Stored as compressed data URLs in D1 (same approach as the logo/QR). They are read
 * one at a time by the image route, never in bulk, so they cost nothing on page loads.
 */

/** Raw stored data URL for a product photo, or null if there is none. */
export async function getProductImage(id: string): Promise<string | null> {
	try {
		const rows = await db()
			.select({ image: products.image })
			.from(products)
			.where(eq(products.id, id))
			.limit(1);
		return rows[0]?.image ? rows[0].image : null;
	} catch {
		return null;
	}
}

/**
 * Save (or clear, with "") a product photo. Bumps image_v so the public URL changes
 * and browsers/CDN pick the new photo up immediately; clearing resets it to 0.
 */
export async function setProductImage(id: string, dataUrl: string): Promise<void> {
	const d = db();
	if (!dataUrl) {
		await d.update(products).set({ image: "", imageV: 0 }).where(eq(products.id, id));
		return;
	}
	const rows = await d
		.select({ imageV: products.imageV })
		.from(products)
		.where(eq(products.id, id))
		.limit(1);
	const next = (rows[0]?.imageV ?? 0) + 1;
	await d.update(products).set({ image: dataUrl, imageV: next }).where(eq(products.id, id));
}

/* ---- category writes (admin) ---- */

export async function createCategory(line: LineId, name: string): Promise<void> {
	const base = `${line}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
	const id = `${base || line + "-cat"}-${crypto.randomUUID().slice(0, 4)}`;
	await db().insert(categories).values({ id, line, name, sort: 9999 });
}

export async function renameCategory(id: string, name: string): Promise<void> {
	await db().update(categories).set({ name }).where(eq(categories.id, id));
}

/** Delete a category only if it has no products. Returns false if it still has products. */
export async function deleteCategory(id: string): Promise<boolean> {
	const d = db();
	const inCat = await d.select({ id: products.id }).from(products).where(eq(products.categoryId, id)).limit(1);
	if (inCat.length) return false;
	await d.delete(categories).where(eq(categories.id, id));
	return true;
}

/* ---- category photos ---- */

export async function getCategoryImage(id: string): Promise<string | null> {
	try {
		const rows = await db()
			.select({ image: categories.image })
			.from(categories)
			.where(eq(categories.id, id))
			.limit(1);
		return rows[0]?.image ? rows[0].image : null;
	} catch {
		return null;
	}
}

/** Save (or clear, with "") a category photo. Mirrors setProductImage. */
export async function setCategoryImage(id: string, dataUrl: string): Promise<void> {
	const d = db();
	if (!dataUrl) {
		await d.update(categories).set({ image: "", imageV: 0 }).where(eq(categories.id, id));
		return;
	}
	const rows = await d
		.select({ imageV: categories.imageV })
		.from(categories)
		.where(eq(categories.id, id))
		.limit(1);
	const next = (rows[0]?.imageV ?? 0) + 1;
	await d.update(categories).set({ image: dataUrl, imageV: next }).where(eq(categories.id, id));
}

/* ---- site images (logo / About photos / home banners) ---- */

/** Listing for a group — URLs and captions only, never the image data. */
export async function listSiteImages(group: SiteImageGroup): Promise<SiteImage[]> {
	try {
		const rows = await db()
			.select({
				id: siteImages.id,
				group: siteImages.group,
				v: siteImages.v,
				caption: siteImages.caption,
				sort: siteImages.sort,
			})
			.from(siteImages)
			.where(eq(siteImages.group, group))
			.orderBy(asc(siteImages.sort));
		return rows.map((r) => ({
			id: r.id,
			group: r.group as SiteImageGroup,
			url: siteImageUrl(r.id, r.v),
			caption: r.caption,
			sort: r.sort,
		}));
	} catch {
		return [];
	}
}

export async function getSiteImageData(id: string): Promise<string | null> {
	try {
		const rows = await db()
			.select({ data: siteImages.data })
			.from(siteImages)
			.where(eq(siteImages.id, id))
			.limit(1);
		return rows[0]?.data ? rows[0].data : null;
	} catch {
		return null;
	}
}

export async function addSiteImage(
	group: SiteImageGroup,
	dataUrl: string,
	caption = "",
): Promise<void> {
	const d = db();
	const existing = await d
		.select({ sort: siteImages.sort })
		.from(siteImages)
		.where(eq(siteImages.group, group));
	const sort = existing.reduce((max, r) => Math.max(max, r.sort), 0) + 1;
	await d.insert(siteImages).values({
		id: `${group}-${crypto.randomUUID().slice(0, 8)}`,
		group,
		data: dataUrl,
		v: 1,
		caption,
		sort,
	});
}

/** For single-image groups (the logo): replace whatever is there. */
export async function setSingleSiteImage(
	group: SiteImageGroup,
	dataUrl: string,
): Promise<void> {
	const d = db();
	await d.delete(siteImages).where(eq(siteImages.group, group));
	if (dataUrl) await addSiteImage(group, dataUrl);
}

export async function updateSiteImageCaption(id: string, caption: string): Promise<void> {
	await db().update(siteImages).set({ caption }).where(eq(siteImages.id, id));
}

export async function deleteSiteImage(id: string): Promise<void> {
	await db().delete(siteImages).where(eq(siteImages.id, id));
}

/** Move a picture one place earlier/later in its group by swapping sort values. */
export async function moveSiteImage(id: string, dir: "up" | "down"): Promise<void> {
	const d = db();
	const rows = await d.select({ id: siteImages.id, group: siteImages.group, sort: siteImages.sort }).from(siteImages);
	const me = rows.find((r) => r.id === id);
	if (!me) return;
	const siblings = rows
		.filter((r) => r.group === me.group)
		.sort((a, b) => a.sort - b.sort);
	const i = siblings.findIndex((r) => r.id === id);
	const j = dir === "up" ? i - 1 : i + 1;
	if (j < 0 || j >= siblings.length) return;
	const other = siblings[j];
	await d.update(siteImages).set({ sort: other.sort }).where(eq(siteImages.id, me.id));
	await d.update(siteImages).set({ sort: me.sort }).where(eq(siteImages.id, other.id));
}

/**
 * The shop logo for the header/footer/hero: the uploaded one when there is one,
 * otherwise "" and the built-in brand-logo.png is used.
 * (Falls back to a logo saved the old way, inside the settings JSON.)
 */
export async function getLogoUrl(): Promise<string> {
	const rows = await listSiteImages("logo");
	if (rows[0]) return rows[0].url;
	const s = await getSettings();
	return s.logo || "";
}

export async function createProduct(p: {
	categoryId: string;
	line: LineId;
	name: string;
	content: string;
	mrp: number;
	price: number;
}): Promise<void> {
	const d = db();
	const id = `${p.categoryId}-${crypto.randomUUID().slice(0, 6)}`;
	// Land after whatever already has the highest sort, so a freshly-added product
	// appears last (not tied with every other product ever added the same way).
	const rows = await d.select({ sort: products.sort }).from(products);
	const sort = rows.reduce((max, r) => Math.max(max, r.sort), 0) + 1;
	await d.insert(products).values({
		id,
		categoryId: p.categoryId,
		line: p.line,
		name: p.name,
		content: p.content,
		mrp: p.mrp,
		price: p.price,
		active: 1,
		stock: -1,
		sort,
	});
}
