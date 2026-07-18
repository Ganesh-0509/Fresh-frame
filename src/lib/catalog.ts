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
} from "@/lib/catalog-types";
import { DEFAULT_SETTINGS, type Settings } from "@/lib/site";

export const categories = sqliteTable("categories", {
	id: text("id").primaryKey(),
	line: text("line").notNull(),
	name: text("name").notNull(),
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
});

export const settingsTable = sqliteTable("settings", {
	key: text("key").primaryKey(),
	value: text("value").notNull(),
});

function db() {
	const { env } = getCloudflareContext();
	if (!env.DB) throw new Error("D1 binding 'DB' is not configured.");
	return drizzle(env.DB, { schema: { categories, products, settingsTable } });
}

/* ---- seed data as the fallback catalog ---- */
function seedCatalog(): Catalog {
	const cats: CatCategory[] = SEED_CATEGORIES.map((c) => ({
		id: c.id,
		line: c.line,
		name: c.name,
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
	}));
	return { categories: cats, products: prods };
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
		const cats = await d.select().from(categories).orderBy(asc(categories.sort));
		const prods = await d.select().from(products).orderBy(asc(products.sort));
		return {
			categories: cats.map((c) => ({ id: c.id, line: c.line as LineId, name: c.name })),
			products: prods.map((p) => ({
				id: p.id,
				categoryId: p.categoryId,
				line: p.line as LineId,
				name: p.name,
				content: p.content,
				mrp: p.mrp,
				price: p.price,
				active: p.active === 1,
				stock: p.stock,
			})),
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

export async function createProduct(p: {
	categoryId: string;
	line: LineId;
	name: string;
	content: string;
	mrp: number;
	price: number;
}): Promise<void> {
	const id = `${p.categoryId}-${crypto.randomUUID().slice(0, 6)}`;
	await db().insert(products).values({
		id,
		categoryId: p.categoryId,
		line: p.line,
		name: p.name,
		content: p.content,
		mrp: p.mrp,
		price: p.price,
		active: 1,
		stock: -1,
		sort: 9999,
	});
}
