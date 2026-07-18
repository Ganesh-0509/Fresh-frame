/**
 * Sivakasi Standard Fireworks — single source of truth for client details.
 *
 * ⚠️ EVERYTHING HERE IS DUMMY DATA. Replace before go-live.
 * Change it here once and the whole site updates.
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
    line1: "DRR Nagar",
    line2: "Avadi",
    line3: "Chennai, Tamil Nadu",
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
} as const;

export const money = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export const sellPrice = (listPrice: number) =>
  Math.round((listPrice * (100 - SITE.discountPct)) / 100);

/**
 * Editable-at-runtime settings (overridable from the admin panel → D1).
 * Everything else in SITE is code-level. Defaults come from SITE.
 */
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
  metaTitle: `${SITE.name} — Crackers Direct from Sivakasi`,
  metaDescription:
    "Quality crackers direct from Sivakasi at wholesale rates. Browse the price list and order online with doorstep transport across South India.",
  logo: "",
};

/** GST amount for a subtotal at the given rate. */
export const gstAmount = (subtotal: number, pct: number) =>
  pct > 0 ? Math.round((subtotal * pct) / 100) : 0;

export const waLinkTo = (whatsapp: string, message: string) =>
  `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const telLink = () => "tel:" + SITE.phone.replace(/\s/g, "");
