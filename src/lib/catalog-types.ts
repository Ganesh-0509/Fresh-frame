/**
 * Client-safe catalogue types + the LINES constant.
 * (No server imports here, so client components can import it freely.)
 */

export type LineId = "standard" | "elite";

export type Line = { id: LineId; name: string; sub: string };

export const LINES: Line[] = [
	{ id: "standard", name: "Standard", sub: "Standard products" },
	{ id: "elite", name: "Elite", sub: "Elite products" },
];

export type CatCategory = { id: string; line: LineId; name: string };

export type CatProduct = {
	id: string;
	categoryId: string;
	line: LineId;
	name: string;
	content: string;
	mrp: number; // struck-through list price
	price: number; // actual selling price
	active: boolean;
	stock: number; // -1 = unlimited/untracked, 0 = out of stock, >0 = units left
};

/** A product is orderable if active and not explicitly out of stock. */
export const inStock = (p: { active: boolean; stock: number }) => p.active && p.stock !== 0;

export type Catalog = {
	categories: CatCategory[];
	products: CatProduct[];
};

export const categoriesByLine = (categories: CatCategory[], line: LineId) =>
	categories.filter((c) => c.line === line);

/** Discount % for display, derived from mrp vs price. */
export const discountPctOf = (p: { mrp: number; price: number }) =>
	p.mrp > 0 && p.price > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
