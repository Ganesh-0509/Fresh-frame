/**
 * Sivakasi Standard Fireworks — single source of truth for client details.
 *
 * These are the CODE-LEVEL defaults (name, domain, seed contact info). Almost
 * everything the owner needs to change is editable at runtime from /admin
 * (see the `Settings` type below) — those overrides win over these defaults.
 * Any value still unconfirmed by the client is listed in PLACEHOLDER-DATA.md.
 */

export const SITE = {
  name: "Standard Fireworks",
  shortName: "STANDARD FIREWORKS",
  // The registered trading firm behind the brand — shown small in the footer.
  legalName: "Murugan Traders",
  tagline: "Crackers direct from Sivakasi",

  // ---- CONTACT ----
  phone: "+91 93441 70018",
  whatsapp: "919344170018", // digits only, country code, no + and no spaces
  email: "standardfireworkssivakasi5@gmail.com",
  address: {
    line1: "Chennai, Tamil Nadu",
  },
  hours: "Mon–Sun · 10:00 AM – 8:00 PM",

  // ---- BUSINESS ----
  gst: "", // client said N/A — "" hides the row
  licence: "", // client said N/A — "" hides the row
  minOrder: 3000,
  discountPct: 50,

  // ---- SPEND-BASED EXTRA DISCOUNT SLABS (shown on the hero banner) ----
  // ⚠️ Placeholder percentages — CLIENT to confirm the real slabs.
  // Spend at least `min` (in ₹) → get `extra`% off ON TOP of the base discount.
  discountTiers: [
    { min: 5000, extra: 2, label: "Spend ₹5,000+" },
    { min: 7000, extra: 4, label: "Spend ₹7,000+" },
    { min: 10000, extra: 6, label: "Spend ₹10,000+" },
  ],

  // ---- PAYMENT (❗ dummy) ----
  // Shown for MANUAL transfer only. There is no payment gateway on this site — by law.
  bank: {
    name: "<Bank name>",
    branch: "<Branch>",
    account: "0000 0000 0000",
    ifsc: "XXXX0000000",
    holder: "<Account holder>",
  },
  upi: "example@upi",
  // Path to the UPI QR image in /public (client to provide). "" → a placeholder box is shown.
  upiQr: "",

  // ---- SOCIAL ("" hides the icon) ----
  facebook: "",
  instagram: "",
  youtube: "",

  // ---- DELIVERY — keep honest, only what their transporter really serves ----
  serviceStates: [
    "Tamil Nadu",
    "Puducherry",
    "Kerala",
    "Karnataka",
    "Andhra Pradesh",
    "Telangana",
  ],

  // ---- BRAND ----
  // ⚠️ Only fill AFTER the client confirms in writing that they may advertise
  // this brand name. They buy wholesale from Standard Fireworks, but being a
  // customer of a brand is not a licence to use its name. "" hides it.
  stockistOf: "",

  // ---- DOMAIN (registered at Hostinger; DNS to be pointed to the Worker at deploy) ----
  domain: "https://standardfireworkssivakasi.com",

  // ---- SEARCH-ENGINE VERIFICATION (paste tokens after registering; "" = not rendered) ----
  // Google Search Console → Settings → Ownership → HTML tag → the content="..." value.
  googleVerification: "",
  // Bing Webmaster Tools → verify via meta tag → the content="..." value (msvalidate.01).
  bingVerification: "",
} as const;

export const money = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export const sellPrice = (listPrice: number) =>
  Math.round((listPrice * (100 - SITE.discountPct)) / 100);

/**
 * Editable-at-runtime settings (overridable from the admin panel → D1).
 * Everything else in SITE is code-level. Defaults come from SITE.
 */
export type DiscountTier = { min: number; extra: number; label: string };

export type Settings = {
  phone: string;
  whatsapp: string;
  email: string;
  upi: string;
  upiQr: string;
  minOrder: number;
  discountPct: number;
  bankName: string;
  bankBranch: string;
  bankAccount: string;
  bankIfsc: string;
  bankHolder: string;
  serviceStates: string[];
  // Per-state transport fee (₹) auto-added at checkout. Missing state → not serviceable.
  transportFees: Record<string, number>;
  // Serviceable cities per state (checkout city is a dropdown of these).
  serviceCities: Record<string, string[]>;
  // GST percentage applied at checkout. 0 = no GST line shown.
  gstPct: number;
  // Whether a UTR (transaction id) is required on the payment-confirmation step.
  requireUtr: boolean;
  // SEO
  metaTitle: string;
  metaDescription: string;
  // Logo (data URL uploaded from admin). "" = built-in brand mark.
  logo: string;
  // Scrolling announcement bar under the hero (season/offer message).
  announcement: string;

  // ---- Business identity / content (all owner-editable) ----
  tagline: string;
  hours: string;
  addressLine: string;
  legalName: string;
  gstNumber: string; // GSTIN shown in footer/contact ("" hides it)
  licence: string; // explosives licence no. ("" hides it)
  stockistOf: string; // brand name, only if allowed ("" hides)
  aboutStory: string; // About-page story, paragraphs split on blank lines
  // Spend-more-save-more slabs shown on the hero.
  discountTiers: DiscountTier[];
  // Social links ("" hides the icon).
  facebook: string;
  instagram: string;
  youtube: string;
};

// ⚠️ Placeholder transport fees + cities — the client sets the real ones in /admin/settings.
const DEFAULT_TRANSPORT: Record<string, number> = {
  "Tamil Nadu": 150,
  Puducherry: 150,
  Kerala: 250,
  Karnataka: 250,
  "Andhra Pradesh": 250,
  Telangana: 300,
};

const DEFAULT_CITIES: Record<string, string[]> = {
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Erode", "Tirunelveli"],
  Puducherry: ["Puducherry"],
  Kerala: ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur"],
  Karnataka: ["Bengaluru", "Mysuru", "Hubli"],
  "Andhra Pradesh": ["Vijayawada", "Visakhapatnam", "Tirupati", "Nellore"],
  Telangana: ["Hyderabad", "Warangal"],
};

export const DEFAULT_SETTINGS: Settings = {
  phone: SITE.phone,
  whatsapp: SITE.whatsapp,
  email: SITE.email,
  upi: SITE.upi,
  upiQr: SITE.upiQr,
  minOrder: SITE.minOrder,
  discountPct: SITE.discountPct,
  bankName: SITE.bank.name,
  bankBranch: SITE.bank.branch,
  bankAccount: SITE.bank.account,
  bankIfsc: SITE.bank.ifsc,
  bankHolder: SITE.bank.holder,
  serviceStates: [...SITE.serviceStates],
  transportFees: DEFAULT_TRANSPORT,
  serviceCities: DEFAULT_CITIES,
  gstPct: 0, // off by default — client enables (e.g. 18) in admin if invoicing GST
  requireUtr: true,
  metaTitle: `${SITE.name} — Sivakasi Crackers Wholesale Price List, Chennai`,
  metaDescription:
    "Buy Sivakasi crackers at wholesale rates, direct to Chennai & South India. See the full Deepavali 2026 cracker price list, build your list and send it on WhatsApp for a same-day estimate. Enquiry only — no online payment.",
  logo: "",
  announcement:
    "BOOKING OPEN FOR DEEPAVALI 2026 · BOOK EARLY FOR BEST STOCK · FREE TRANSPORT-OFFICE DELIVERY ACROSS SOUTH INDIA",

  tagline: SITE.tagline,
  hours: SITE.hours,
  addressLine: SITE.address.line1,
  legalName: SITE.legalName,
  gstNumber: SITE.gst,
  licence: SITE.licence,
  stockistOf: SITE.stockistOf,
  aboutStory:
    "Murugan Traders has been in the fireworks trade for over 12 years. What began as a small seasonal stall — a few boxes brought up from Sivakasi each Deepavali — has grown, one honest order at a time, into a business that families across Chennai come back to every year.\n\n" +
    "We buy wholesale straight from established Sivakasi manufacturers and sell direct — to families, temples, schools and function organisers. No showroom rent, no salesmen, no commission agents. That is the whole reason our rate is what it is.\n\n" +
    "Twelve years on, the promise hasn't changed: the same crackers the big shops sell, at the price we buy them for — and a real person on the other end of the phone.",
  discountTiers: SITE.discountTiers.map((t) => ({ ...t })),
  facebook: SITE.facebook,
  instagram: SITE.instagram,
  youtube: SITE.youtube,
};

/**
 * Live, owner-editable view of the site content. Merges the fixed structural
 * bits from SITE (name, domain) with everything the owner edits in /admin.
 * Public pages/components consume THIS (via getSettings), so admin edits show
 * up immediately on the live site.
 */
export function publicSite(s: Settings) {
  return {
    name: SITE.name,
    shortName: SITE.shortName,
    domain: SITE.domain,
    tagline: s.tagline,
    phone: s.phone,
    whatsapp: s.whatsapp,
    email: s.email,
    hours: s.hours,
    addressLine: s.addressLine,
    legalName: s.legalName,
    gst: s.gstNumber,
    licence: s.licence,
    stockistOf: s.stockistOf,
    minOrder: s.minOrder,
    discountPct: s.discountPct,
    discountTiers: s.discountTiers,
    serviceStates: s.serviceStates,
    bank: {
      name: s.bankName,
      branch: s.bankBranch,
      account: s.bankAccount,
      ifsc: s.bankIfsc,
      holder: s.bankHolder,
    },
    upi: s.upi,
    upiQr: s.upiQr,
    facebook: s.facebook,
    instagram: s.instagram,
    youtube: s.youtube,
    aboutStory: s.aboutStory,
    announcement: s.announcement,
  };
}
export type PublicSite = ReturnType<typeof publicSite>;

/** GST amount for a subtotal at the given rate. */
export const gstAmount = (subtotal: number, pct: number) =>
  pct > 0 ? Math.round((subtotal * pct) / 100) : 0;

export const waLinkTo = (whatsapp: string, message: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const telLink = () => "tel:" + SITE.phone.replace(/\s/g, "");

export const telLinkTo = (phone: string) => "tel:" + phone.replace(/\s/g, "");
