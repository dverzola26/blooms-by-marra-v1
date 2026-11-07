import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, ChevronDown, MapPin, MessageCircle, Store, Truck } from "lucide-react";
import styles from "@/components/info-layout.module.css";
const pages: Record<
  string,
  { title: string; kicker: string; sections: [string, string][] }
> = {
  about: {
    title: "About Blooms by Marra",
    kicker: "BLOOMS BY MARRA",
    sections: [
      [
        "Your everyday florist for every occasion",
        "Our local teams serve Metro Manila and Pampanga from our Valenzuela and Angeles branches.",
      ],
      [
        "A story still unfolding",
        "The owner-approved brand story and authentic shop gallery will be added before launch. The bouquets in this preview are illustrative, not photographs of actual inventory.",
      ],
    ],
  },
  delivery: {
    title: "Delivery and pickup",
    kicker: "DELIVERY & PICKUP",
    sections: [
      [
        "Metro Manila · Valenzuela branch",
        "The Valenzuela branch serves Metro Manila. Many regular online bouquet prices include delivery within the applicable area; the shop confirms availability and any fees. This preview uses sample checkout rates.",
      ],
      [
        "Pampanga · Angeles branch",
        "Pampanga fees and product availability are branch-specific. Metro Manila delivery inclusion does not automatically apply. Outside-area deliveries cannot be guaranteed.",
      ],
      [
        "Same-day requests",
        "Same-day delivery requests depend on flower availability, delivery capacity and shop confirmation. Please ask the shop about the current request cutoff. Pickup is handled separately.",
      ],
      [
        "Store pickup",
        "Choose pickup and your preferred branch, date and window. Pickup carries no delivery fee and follows separate availability rules.",
      ],
      [
        "Delivery fees",
        "Where a product includes delivery for your city, checkout will not add another delivery fee. Standees use destination-city rates. Custom and rush arrangements require review.",
      ],
    ],
  },
  contact: {
    title: "Contact and branches",
    kicker: "CONTACT & BRANCHES",
    sections: [
      [
        "Speak with the team",
        "For an arrangement, a custom request or branch details, contact the official Blooms by Marra Facebook page. Please do not send payment details through this preview.",
      ],
      [
        "Valenzuela · Metro Manila",
        "111 McArthur Highway, Marulas, Valenzuela, Philippines. Open 8:00 AM–8:00 PM. Please contact the shop for pickup instructions.",
      ],
      [
        "Angeles · Pampanga",
        "Galang-Wong Building, Salome Street, Brgy. Balibago, Angeles City, Pampanga. Open 8:00 AM–8:00 PM. Please contact the shop to confirm the address and pickup instructions.",
      ],
      [
        "Custom arrangements",
        "Hi po! Share your occasion, preferred date and time, delivery or pickup, location, budget and preferred flowers or design. Reference photos are inspiration; the shop will confirm availability and the final quote.",
      ],
    ],
  },
  faq: {
    title: "Frequently asked questions",
    kicker: "FREQUENTLY ASKED QUESTIONS",
    sections: [
      ["What are your hours?", "We are open from 8:00 AM to 8:00 PM. Inquiries can be sent outside operating hours; availability and pricing require confirmation."],
      ["Do you offer same-day delivery?", "Same-day requests are subject to availability and shop confirmation. Please ask the shop about the current request cutoff. Pickup follows separate availability rules."],
      ["What payment methods are accepted?", "GCash, GoTyme, QR Ph and Maya are accepted. Cash is available for pickup only; cash on delivery is not offered. The shop confirms payment instructions and the required amount."],
      [
        "Is this a live shop?",
        "This is a working demo storefront. The catalog, prices and bouquet imagery are illustrative. No live orders or payments are accepted.",
      ],
      [
        "Is an order request a confirmation?",
        "No. Staff must review inventory, price and fulfillment. Exceptional same-day requests and custom work need approval.",
      ],
      [
        "Does a payment screenshot mean paid?",
        "No. Proof is submitted for review. Only authorized staff can verify payment; fulfillment is tracked separately.",
      ],
      [
        "Can I pay a deposit?",
        "Only when the owner approves it for your order. An approved deposit must be at least 50%; some orders require full payment.",
      ],
      [
        "Can I request a change?",
        "Draft store policy asks for changes at least a day before delivery outside peak seasons, subject to confirmation. Full wording needs owner and legal review.",
      ],
    ],
  },
  policies: {
    title: "Draft policies and privacy",
    kicker: "DRAFT POLICIES · NOT LAUNCH-APPROVED",
    sections: [
      [
        "Orders & payments",
        "A request does not guarantee stock or timing. Staff must approve fulfillment and verify payment. Cash is pickup-only. Payment proofs are private and must never be treated as automatic confirmation.",
      ],
      [
        "Changes & cancellations — draft",
        "The proposed store policy treats paid orders as non-refundable and disallows cancellations or changes during peak seasons. Outside peak seasons, changes should be requested at least one day ahead and confirmed by staff. These terms need owner/legal review and do not exclude mandatory consumer rights.",
      ],
      [
        "Concerns & care — draft",
        "The proposed reporting window is within two hours of receipt, with photos. Confirmed shop faults may be remedied with replacement or store credit, according to approved terms and applicable law. Outdoor use needs appropriate care. Mandatory legal rights remain unaffected.",
      ],
      [
        "Privacy in this preview",
        "Your demo cart and gift message are saved in this browser until cleared. Checkout contact fields are not sent to a backend or stored. Use fictional details. Clear the demo cart to remove its local data.",
      ],
      [
        "Before production",
        "A reviewed privacy notice, retention schedule, deletion process, privacy contact and finalized consumer policies must be supplied before accepting personal information.",
      ],
    ],
  },
};
const introductions: Record<string, string> = {
  about: "Flowers for everyday gestures and the occasions you want to remember.",
  delivery: "Choose delivery or pickup. Every request is subject to confirmation.",
  contact: "Find a branch or ask about an arrangement.",
  faq: "Answers about requests, delivery, pickup and payment review.",
  policies: "Please review these draft policies with the shop before making plans.",
};
export function generateStaticParams() {
  return Object.keys(pages).map((info) => ({ info }));
}
export default async function Info({
  params,
}: {
  params: Promise<{ info: string }>;
}) {
  const { info } = await params;
  const p = pages[info];
  if (!p) notFound();
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>{p.title}</h1>
          <p>{introductions[info]}</p>
          {info === "policies" && <span className={styles.draft}>Draft · subject to owner and legal review</span>}
        </div>
      </div>

      <section className={styles.content} aria-label={p.kicker}>
        {info === "contact" ? (
          <>
            <div className={styles.sectionIntro}>
              <div><h2>Our branches</h2><p>Contact the shop to confirm branch details before visiting.</p></div>
              <Store aria-hidden="true" size={28} strokeWidth={1.4} />
            </div>
            <div className={styles.branches}>
              {p.sections.slice(1, 3).map(([h, t]) => (
                <article className={styles.branch} key={h}>
                  <MapPin aria-hidden="true" size={22} strokeWidth={1.5} />
                  <h3>{h}</h3><p>{t}</p>
                </article>
              ))}
            </div>
            <div className={styles.contactPanel}>
              <MessageCircle aria-hidden="true" size={28} strokeWidth={1.4} />
              <div><h2>{p.sections[0][0]}</h2><p>{p.sections[0][1]}</p>
                <a className={styles.textLink} href="https://www.facebook.com/bloomsbymarra/" target="_blank" rel="noopener noreferrer">Contact on Facebook <ArrowUpRight size={16} aria-hidden="true" /></a>
              </div>
            </div>
            <article className={styles.readingRow}><h2>{p.sections[3][0]}</h2><p>{p.sections[3][1]}</p></article>
          </>
        ) : info === "faq" ? (
          <div className={styles.faqList}>
            {p.sections.map(([h, t]) => (
              <details key={h} className={styles.faqItem}>
                <summary><span>{h}</span><ChevronDown aria-hidden="true" size={20} /></summary>
                <p>{t}</p>
              </details>
            ))}
          </div>
        ) : (
          <>
            {info === "delivery" && <div className={styles.serviceStrip}><Truck size={23} aria-hidden="true" /> Delivery subject to confirmation <span aria-hidden="true">·</span> <Store size={23} aria-hidden="true" /> Pickup at your chosen branch</div>}
            <div className={styles.readingList}>
              {p.sections.map(([h, t]) => (
                <article className={styles.readingRow} key={h}><h2>{h}</h2><p>{t}</p></article>
              ))}
            </div>
          </>
        )}
        {info !== "contact" && <div className={styles.footerAction}><p>Browse the sample collection.</p><Link className="button" href="/shop">Explore the demo flowers</Link></div>}
      </section>
    </div>
  );
}
