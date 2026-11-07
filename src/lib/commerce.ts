import { z } from "zod";
export const settings = {
  cutoff: "14:00",
  timezone: "Asia/Manila",
  commerceEnabled: false,
};
export type Branch = "valenzuela" | "angeles";
export type Product = {
  id: string;
  name: string;
  occasion: string;
  occasionTags?: string[];
  category: "blooms" | "funeral-flowers" | "inaugural-flowers";
  bloomType?: "local-roses" | "china-roses";
  type: "bouquet" | "standee";
  price: number;
  branch: Branch;
  included: string[];
  custom?: boolean;
};
export const products: Product[] = [
  {
    id: "blush-study",
    category: "blooms",
    name: "Blush garden study",
    occasion: "Birthday",
    type: "bouquet",
    price: 120000,
    branch: "valenzuela",
    included: ["Valenzuela"],
  },
  {
    id: "rose-study",
    category: "blooms",
    name: "Rose poetry study",
    occasion: "Anniversary",
    occasionTags: ["Love & Romance"],
    type: "bouquet",
    price: 150000,
    branch: "valenzuela",
    included: ["Valenzuela"],
  },
  {
    id: "sunshine-study",
    category: "blooms",
    name: "Sunlit meadow study",
    occasion: "Congratulations",
    occasionTags: ["Get Well Soon"],
    type: "bouquet",
    price: 180000,
    branch: "angeles",
    included: [],
  },
  {
    id: "ivory-study",
    category: "funeral-flowers",
    name: "Ivory tribute study",
    occasion: "Sympathy",
    type: "standee",
    price: 250000,
    branch: "valenzuela",
    included: [],
  },
  {
    id: "custom-study",
    category: "blooms",
    name: "Your own floral story",
    occasion: "Custom",
    type: "bouquet",
    price: 0,
    branch: "angeles",
    included: [],
    custom: true,
  },
];
export const productImages: Record<string, string> = {
  "blush-study": "/images/pink.png",
  "rose-study": "/images/roses.png",
  "sunshine-study": "/images/sunflowers.png",
  "ivory-study": "/images/lilies.png",
  "custom-study": "/images/mixed.png",
};
export const cities: Record<Branch, string[]> = {
  valenzuela: ["Valenzuela", "Manila", "Quezon City", "Makati"],
  angeles: ["Angeles", "San Fernando", "Mabalacat"],
};
// Fixture fees only. Never used for real commerce.
export const demoRates: Record<string, number> = {
  Valenzuela: 15000,
  Manila: 25000,
  "Quezon City": 25000,
  Makati: 30000,
  Angeles: 18000,
  "San Fernando": 25000,
  Mabalacat: 22000,
};
export const money = (n: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    maximumFractionDigits: 0,
  }).format(n / 100);
export function manilaDate(now: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: settings.timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
export function fulfillmentReview(
  mode: "delivery" | "pickup",
  date: string,
  cutoff = settings.cutoff,
  now = new Date(),
  stock = true,
  custom = false,
) {
  if (date < manilaDate(now)) return "unavailable";
  if (!stock || custom) return "needs_review";
  if (mode === "pickup" || date !== manilaDate(now))
    return "pending_confirmation";
  const time = new Intl.DateTimeFormat("en-GB", {
    timeZone: settings.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(now);
  return time >= cutoff ? "needs_review" : "pending_confirmation";
}
export type Line = { id: string; quantity: number; message: string };
export function priceCart(
  lines: Line[],
  mode: "delivery" | "pickup",
  branch: Branch,
  city: string,
) {
  const selected = lines.map((l) => ({
    p: products.find((p) => p.id === l.id),
    l,
  }));
  if (
    !selected.length ||
    selected.some(
      ({ p, l }) =>
        !p ||
        !Number.isInteger(l.quantity) ||
        l.quantity < 1 ||
        l.quantity > 20,
    )
  )
    throw Error("Your cart needs valid items.");
  if (mode === "delivery" && !cities[branch].includes(city))
    throw Error("This destination is outside the selected demo service area.");
  if (selected.some(({ p }) => p!.branch !== branch))
    throw Error(
      "Choose arrangements from one branch. Manual transfers require staff review.",
    );
  const subtotal = selected.reduce(
    (s, { p, l }) => s + p!.price * l.quantity,
    0,
  );
  const quoted = selected.some(({ p }) => p!.custom);
  const included =
    mode === "delivery" &&
    selected.every(({ p }) => p!.included.includes(city));
  const fee = mode === "pickup" || included ? 0 : demoRates[city];
  return {
    subtotal,
    fee: fee ?? 0,
    total: quoted ? null : subtotal + (fee ?? 0),
    included,
    quoted,
  };
}
export const checkoutSchema = z
  .object({
    customer: z.string().trim().min(2).max(100),
    email: z.email(),
    phone: z
      .string()
      .regex(/^(?:\+63|0)9\d{9}$/, "Enter a Philippine mobile number."),
    recipient: z.string().trim().min(2).max(100),
    recipientPhone: z
      .string()
      .regex(/^(?:\+63|0)9\d{9}$/, "Enter a recipient mobile number."),
    address: z.string().max(500),
    mode: z.enum(["delivery", "pickup"]),
    payment: z.enum(["GCash", "Maya", "GoTyme", "MariBank", "QR Ph", "Cash"]),
    date: z.iso.date(),
    window: z.enum(["Morning", "Afternoon"]),
    consent: z.literal(true),
  })
  .superRefine((v, c) => {
    if (v.mode === "delivery" && v.address.trim().length < 10)
      c.addIssue({
        code: "custom",
        path: ["address"],
        message: "Enter the complete delivery address.",
      });
    if (v.mode === "delivery" && v.payment === "Cash")
      c.addIssue({
        code: "custom",
        path: ["payment"],
        message: "Cash is available for pickup only.",
      });
  });
export type Payment = "unpaid" | "submitted" | "verified";
export function paymentTransition(
  current: Payment,
  next: Payment,
  role: "customer" | "staff" | "owner",
) {
  if (next === "verified" && role === "customer")
    throw Error("Staff verification required.");
  if (current === "verified" && next !== "verified")
    throw Error("Verified payments require an audited correction.");
  return next;
}
export function depositDue(total: number, percent: number, approved: boolean) {
  if (
    !Number.isInteger(total) ||
    total < 0 ||
    !Number.isInteger(percent) ||
    percent > 100
  )
    throw Error("Invalid payment amount.");
  if (percent !== 100 && (!approved || percent < 50))
    throw Error("Owner approval required for deposits of at least 50%.");
  return Math.ceil((total * percent) / 100);
}
