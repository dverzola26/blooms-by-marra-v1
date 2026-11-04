import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  Truck,
  Store,
  MapPin,
  Flower2,
  Heart,
  Headphones,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { Arrow, Bouquet, ProductCard, Trust } from "@/components/store";
import { products } from "@/lib/commerce";
const occasions = [
  { name: "Birthday", image: "pink" },
  { name: "Anniversary", image: "roses" },
  { name: "Love & Romance", image: "roses" },
  { name: "Get Well Soon", image: "sunflowers" },
  { name: "Congratulations", image: "mixed" },
  { name: "Sympathy", image: "lilies" },
];
export default function Home() {
  return (
    <div className="reference-home">
      <section
        className="reference-hero"
        aria-label="Blooms by Marra flower shop"
      >
        <div className="hero-art">
          <Image
            src="/images/hero-floral.png"
            alt="Illustrative mixed bouquet in blush wrapping; demo artwork"
            fill
            sizes="100vw"
            priority
            className="hero-background"
          />
        </div>
        <div className="hero-identity">
          <Image
            className="hero-botanical"
            src="/images/botanical.png"
            alt=""
            width={180}
            height={280}
          />
          <div className="hero-brand">
            <p className="hero-overline">
              FLOWER DELIVERY <Heart size={12} fill="currentColor" /> MANILA &
              PAMPANGA
            </p>
            <h1>
              BLOOMS BY
              <br />
              MARRA
            </h1>
            <p className="hero-shop">F L O W E R &nbsp; S H O P</p>
            <p className="hero-tagline">
              Your everyday florist for every occasion.
            </p>
            <Link className="button rose-button" href="/shop">
              Shop Bouquets <Arrow />
            </Link>
            <Link className="hero-custom" href="/contact?request=custom">
              Request a custom arrangement
            </Link>
          </div>
        </div>
        <span className="hero-demo">ILLUSTRATIVE DEMO ARRANGEMENT</span>
      </section>
      <Trust />
      <section className="occasion-section home-section">
        <div className="home-heading centered">
          <h2>Shop by Occasion</h2>
          <div className="heading-flourish">
            <span />
            <Flower2 size={16} />
            <span />
          </div>
          <p>Find the perfect gesture for life’s special moments.</p>
        </div>
        <div className="reference-occasions">
          {occasions.map((o) => (
            <Link
              className="occasion-tile"
              href={`/shop?occasion=${encodeURIComponent(o.name)}`}
              key={o.name}
            >
              <Bouquet src={`/images/${o.image}.png`} decorative />
              <h3>{o.name}</h3>
            </Link>
          ))}
        </div>
        <p className="occasion-scroll-note">
          Swipe to explore all occasions <Arrow />
        </p>
      </section>
      <section className="featured-section home-section">
        <div className="home-heading">
          <div>
            <h2>
              The Demo Collection <Flower2 size={25} strokeWidth={1} />
            </h2>
            <p>
              Beautiful inspiration, thoughtfully arranged. Sample prices only.
            </p>
          </div>
          <Link className="text-link" href="/shop">
            View All Products <Arrow />
          </Link>
        </div>
        <div className="reference-products">
          {[
            "rose-study",
            "blush-study",
            "sunshine-study",
            "custom-study",
            "ivory-study",
          ].map((id) => (
            <ProductCard
              key={id}
              product={products.find((p) => p.id === id)!}
            />
          ))}
        </div>
      </section>
      <section
        className="ordering-guide home-section"
        aria-labelledby="guide-heading"
      >
        <div className="guide-title">
          <Store size={49} strokeWidth={1} />
          <h2 id="guide-heading">
            Shop Hours &<br />
            Ordering Guide
          </h2>
        </div>
        <div className="guide-options">
          {[
            [Clock, "Shop hours", "Confirm with our team"],
            [Truck, "Delivery requests", "Subject to approval"],
            [Store, "Store pickup", "Choose your branch"],
            [Heart, "Made personal", "Custom inquiries welcome"],
          ].map(([Icon, title, text]) => {
            const I = Icon as typeof Clock;
            return (
              <Link href="/delivery" key={String(title)}>
                <I size={28} strokeWidth={1.3} />
                <strong>{String(title)}</strong>
                <span>{String(text)}</span>
              </Link>
            );
          })}
        </div>
      </section>
      <section
        className="reference-branches home-section"
        aria-label="Our branches"
      >
        <h2 className="mobile-branch-heading">Our Branches</h2>
        {[
          [
            "Valenzuela Branch",
            "Metro Manila",
            "Pickup details await owner verification.",
          ],
          [
            "Pampanga Branch",
            "Angeles City, Pampanga",
            "Pickup details await owner verification.",
          ],
        ].map(([name, region, details]) => (
          <Link className="reference-branch" href="/contact" key={name}>
            <div className="branch-illustration">
              <Store size={48} strokeWidth={1} />
            </div>
            <MapPin className="branch-pin" size={24} strokeWidth={1.3} />
            <div>
              <h3>{name}</h3>
              <p>{region}</p>
              <small>{details}</small>
            </div>
            <ChevronRight className="branch-chevron" size={18} />
          </Link>
        ))}
      </section>
      <section className="reference-values home-section">
        <div className="values-content">
          <h2>Why Choose Blooms by Marra?</h2>
          <div className="value-list">
            {[
              [Flower2, "Thoughtful", "Arrangements"],
              [Heart, "For Meaningful", "Moments"],
              [Store, "Local Branch", "Pickup"],
              [Headphones, "Personal", "Assistance"],
              [ShieldCheck, "Payment Review", "By Our Team"],
            ].map(([Icon, a, b]) => {
              const I = Icon as typeof Heart;
              return (
                <div key={String(a)}>
                  <I size={30} strokeWidth={1.2} />
                  <span>
                    {String(a)}
                    <br />
                    {String(b)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div className="reference-closing">
          <h2>
            Make Someone’s
            <br />
            Day Special
          </h2>
          <Link className="button" href="/shop">
            Shop Now <Arrow />
          </Link>
        </div>
      </section>
      <section className="home-faq home-section">
        <details>
          <summary>Good to know before you order</summary>
          <p>
            This is a demo storefront with illustrative arrangements and sample
            prices. No real order or payment is accepted. Delivery, inventory
            and timing require staff confirmation.{" "}
            <Link href="/faq">Read the ordering FAQ →</Link>
          </p>
        </details>
      </section>
    </div>
  );
}
