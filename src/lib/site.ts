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

  // ---- DOMAIN (❗ client has one — confirm the exact name) ----
  domain: "https://example.com",
} as const;

export const money = (n: number) => "₹" + Number(n).toLocaleString("en-IN");

export const sellPrice = (listPrice: number) =>
  Math.round((listPrice * (100 - SITE.discountPct)) / 100);

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;

export const telLink = () => "tel:" + SITE.phone.replace(/\s/g, "");
