/**
 * Product catalogue.
 *
 * ⚠️ DUMMY DATA — replace with the client's real price list.
 * In Phase 2 this moves into Cloudflare D1 and becomes editable from /admin.
 * Keeping the shape identical now means the swap is a drop-in.
 *
 * listPrice = the printed manufacturer list price (the struck-through number).
 * The selling price is DERIVED from SITE.discountPct — never hardcode it.
 */

export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export type Product = {
  id: string;
  categoryId: string;
  name: string;
  content: string; // pack size, e.g. "1 box (10 pcs)"
  listPrice: number;
  isGreen?: boolean; // true ONLY for NEERI-certified, QR-coded stock
};

export const CATEGORIES: Category[] = [
  { id: "sparklers", name: "Sparklers", emoji: "✨" },
  { id: "flowerpots", name: "Flower Pots", emoji: "🌋" },
  { id: "chakkars", name: "Ground Chakkars", emoji: "🌀" },
  { id: "rockets", name: "Rockets", emoji: "🚀" },
  { id: "sound", name: "Sound Crackers", emoji: "💥" },
  { id: "cakes", name: "Mega Cakes", emoji: "🎆" },
  { id: "kids", name: "Kids Special", emoji: "🧒" },
  { id: "gift", name: "Gift Boxes", emoji: "🎁" },
];

export const PRODUCTS: Product[] = [
  // --- Sparklers ---
  { id: "sp-10", categoryId: "sparklers", name: "10 cm Sparklers", content: "1 box (10 pcs)", listPrice: 60, isGreen: true },
  { id: "sp-15", categoryId: "sparklers", name: "15 cm Sparklers", content: "1 box (10 pcs)", listPrice: 95, isGreen: true },
  { id: "sp-30", categoryId: "sparklers", name: "30 cm Sparklers", content: "1 box (10 pcs)", listPrice: 180, isGreen: true },
  { id: "sp-30c", categoryId: "sparklers", name: "30 cm Colour Sparklers", content: "1 box (10 pcs)", listPrice: 260 },
  { id: "sp-50", categoryId: "sparklers", name: "50 cm Sparklers", content: "1 box (5 pcs)", listPrice: 340 },

  // --- Flower pots ---
  { id: "fp-s", categoryId: "flowerpots", name: "Flower Pot Small", content: "1 box (10 pcs)", listPrice: 150, isGreen: true },
  { id: "fp-b", categoryId: "flowerpots", name: "Flower Pot Big", content: "1 box (10 pcs)", listPrice: 320, isGreen: true },
  { id: "fp-sp", categoryId: "flowerpots", name: "Flower Pot Special", content: "1 box (5 pcs)", listPrice: 480 },
  { id: "fp-koti", categoryId: "flowerpots", name: "Colour Koti", content: "1 box (5 pcs)", listPrice: 620 },

  // --- Chakkars ---
  { id: "ch-s", categoryId: "chakkars", name: "Ground Chakkar Small", content: "1 box (10 pcs)", listPrice: 140, isGreen: true },
  { id: "ch-b", categoryId: "chakkars", name: "Ground Chakkar Big", content: "1 box (10 pcs)", listPrice: 290, isGreen: true },
  { id: "ch-sp", categoryId: "chakkars", name: "Ground Chakkar Special", content: "1 box (5 pcs)", listPrice: 450 },

  // --- Rockets ---
  { id: "rk-b", categoryId: "rockets", name: "Rocket Bomb", content: "1 box (10 pcs)", listPrice: 280 },
  { id: "rk-w", categoryId: "rockets", name: "Whistling Rocket", content: "1 box (10 pcs)", listPrice: 340 },
  { id: "rk-p", categoryId: "rockets", name: "Parachute Rocket", content: "1 box (5 pcs)", listPrice: 520 },

  // --- Sound ---
  { id: "sd-234", categoryId: "sound", name: "Classic Crackers 2¾″", content: "1 box (10 pcs)", listPrice: 190 },
  { id: "sd-4", categoryId: "sound", name: "Classic Crackers 4″", content: "1 box (10 pcs)", listPrice: 290 },
  { id: "sd-hydro", categoryId: "sound", name: "Hydro Bomb", content: "1 box (10 pcs)", listPrice: 420 },
  { id: "sd-1000", categoryId: "sound", name: "Garland 1000 Wala", content: "1 pc", listPrice: 850 },

  // --- Cakes ---
  { id: "ck-12", categoryId: "cakes", name: "12 Shots Cake", content: "1 pc", listPrice: 380 },
  { id: "ck-30", categoryId: "cakes", name: "30 Shots Cake", content: "1 pc", listPrice: 850 },
  { id: "ck-60", categoryId: "cakes", name: "60 Shots Cake", content: "1 pc", listPrice: 1650 },
  { id: "ck-120", categoryId: "cakes", name: "120 Shots Cake", content: "1 pc", listPrice: 3200 },

  // --- Kids ---
  { id: "kd-pencil", categoryId: "kids", name: "Pencil / Twinkling Star", content: "1 box (10 pcs)", listPrice: 110, isGreen: true },
  { id: "kd-snake", categoryId: "kids", name: "Snake Tablet", content: "1 box (10 pcs)", listPrice: 70 },
  { id: "kd-whip", categoryId: "kids", name: "Magic Whip", content: "1 box (10 pcs)", listPrice: 95, isGreen: true },
  { id: "kd-caps", categoryId: "kids", name: "Roll Caps", content: "1 box (10 pcs)", listPrice: 80 },

  // --- Gift ---
  { id: "gf-30", categoryId: "gift", name: "Family Gift Box – 30 items", content: "1 box", listPrice: 1800 },
  { id: "gf-50", categoryId: "gift", name: "Family Gift Box – 50 items", content: "1 box", listPrice: 3200 },
  { id: "gf-75", categoryId: "gift", name: "Mega Gift Box – 75 items", content: "1 box", listPrice: 5500 },
];

export const productsByCategory = (categoryId: string) =>
  PRODUCTS.filter((p) => p.categoryId === categoryId);
