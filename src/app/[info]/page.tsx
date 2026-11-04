import Link from "next/link";
import { notFound } from "next/navigation";
const pages: Record<
  string,
  { title: string; kicker: string; sections: [string, string][] }
> = {
  about: {
    title: "Every gesture has a story.",
    kicker: "BLOOMS BY MARRA",
    sections: [
      [
        "Your everyday florist for every occasion",
        "A place for thoughtful flowers and meaningful moments. Our branches serve Metro Manila and Pampanga through local teams.",
      ],
      [
        "A story still unfolding",
        "The owner-approved brand story and authentic shop gallery will be added before launch. The bouquets in this preview are illustrative, not photographs of actual inventory.",
      ],
    ],
  },
  delivery: {
    title: "From our hands to yours.",
    kicker: "DELIVERY & PICKUP",
    sections: [
      [
        "Metro Manila · Valenzuela branch",
        "Delivery coverage and city-level fees will be confirmed by the owner before launch. The checkout currently uses a limited, clearly labeled fixture matrix.",
      ],
      [
        "Pampanga · Angeles branch",
        "Pampanga fees and product availability are branch-specific. Metro Manila delivery inclusion does not automatically apply. Outside-area deliveries cannot be guaranteed.",
      ],
      [
        "A little planning goes a long way",
        "Same-day availability depends on local stock, staff capacity and routing. Requests at or after the configured cutoff need approval. The public cutoff is awaiting owner confirmation.",
      ],
      [
        "Prefer to stop by?",
        "Choose pickup and your preferred branch, date and window. Pickup carries no delivery fee and follows separate availability rules.",
      ],
      [
        "Included means included",
        "Where a product includes delivery for your city, checkout will not add another delivery fee. Standees use destination-city rates. Custom and rush arrangements require review.",
      ],
    ],
  },
  contact: {
    title: "Let’s make it personal.",
    kicker: "CONTACT & BRANCHES",
    sections: [
      [
        "Speak with the team",
        "For an arrangement, a custom request or branch details, contact the official Blooms by Marra Facebook page. Please do not send payment details through this preview.",
      ],
      [
        "Valenzuela · Metro Manila",
        "Pickup address, map pin, contact number and current opening hours await owner verification.",
      ],
      [
        "Angeles · Pampanga",
        "Pickup address, map pin, contact number and current opening hours await owner verification.",
      ],
      [
        "Custom arrangements",
        "Share your occasion, preferred colors, budget, branch and date with the team. Custom and rush work requires a confirmed quote and availability review.",
      ],
    ],
  },
  faq: {
    title: "A few thoughtful answers.",
    kicker: "FREQUENTLY ASKED QUESTIONS",
    sections: [
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
    title: "Clear expectations. Thoughtful care.",
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
    <section className="section info-page">
      <p className="eyebrow">{p.kicker}</p>
      <h1>{p.title}</h1>
      <div className="info-grid">
        {p.sections.map(([h, t]) => (
          <article key={h}>
            <h2>{h}</h2>
            <p>{t}</p>
          </article>
        ))}
      </div>
      {info === "contact" ? (
        <a
          className="button"
          href="https://www.facebook.com/bloomsbymarra/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Contact on Facebook ↗
        </a>
      ) : (
        <Link className="button" href="/shop">
          Explore the demo flowers
        </Link>
      )}
    </section>
  );
}
