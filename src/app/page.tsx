import Image from "next/image";
import Link from "next/link";
import { MapPin, Store, Truck } from "lucide-react";
import { Arrow, ProductCard } from "@/components/store";
import { products } from "@/lib/commerce";
import { categories } from "@/lib/categories";
import styles from "./home-redesign.module.css";

const occasions = [
  { name: "Birthday", image: "pink" },
  { name: "Anniversary", image: "roses" },
  { name: "Love & Romance", image: "mixed" },
  { name: "Get Well Soon", image: "sunflowers" },
  { name: "Congratulations", image: "mixed" },
  { name: "Sympathy", image: "lilies" },
];

export default function Home() {
  return (
    <div className={styles.home}>
      <section className={styles.hero}>
        <Image
          className={styles.heroImage}
          src="/images/hero-floral.png"
          alt="Illustrative bouquet in blush wrapping; demo artwork"
          fill
          sizes="100vw"
          priority
        />
        <div className={styles.heroCopy}>
          <h1>Flowers for every occasion.</h1>
          <p>
            Thoughtful arrangements for delivery or pickup, subject to shop
            confirmation.
          </p>
          <Link href="/shop">
            Explore the demo collection <Arrow />
          </Link>
        </div>
        <span className={styles.heroLabel}>Illustrative demo arrangement</span>
      </section>
      <div
        className={styles.services}
        aria-label="Delivery and pickup information"
      >
        <Link href="/delivery">
          <Truck size={30} aria-hidden="true" />
          <div>
            <strong>Delivery requests</strong>
            <span>Availability is subject to confirmation.</span>
          </div>
        </Link>
        <Link href="/contact">
          <Store size={30} aria-hidden="true" />
          <div>
            <strong>Store pickup</strong>
            <span>Choose Valenzuela or Angeles.</span>
          </div>
        </Link>
      </div>
      <section className={`${styles.section} ${styles.categorySection}`}>
        <div className={styles.heading}>
          <div>
            <h2>Browse by category</h2>
            <p>
              Explore the demo collection. More products are being prepared.
            </p>
          </div>
        </div>
        <nav className={styles.categoryNav} aria-label="Flower categories">
          <div>
            <Link href="/shop?category=blooms">
              Blooms <Arrow />
            </Link>
            <ul>
              {categories
                .filter((c) => "parent" in c)
                .map((c) => (
                  <li key={c.id}>
                    <Link href={`/shop?category=${c.id}`}>{c.name}</Link>
                  </li>
                ))}
            </ul>
          </div>
          {categories
            .filter((c) => !("parent" in c) && c.id !== "blooms")
            .map((c) => (
              <Link key={c.id} href={`/shop?category=${c.id}`}>
                {c.name} <Arrow />
              </Link>
            ))}
        </nav>
      </section>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div>
            <h2>Explore the demo collection</h2>
            <p>
              Illustrative arrangements and sample prices, while the real
              catalog is being prepared.
            </p>
          </div>
          <Link href="/shop">View all demo flowers →</Link>
        </div>
        <div className={styles.products}>
          {["rose-study", "blush-study", "sunshine-study", "ivory-study"].map(
            (id, index) => (
              <ProductCard
                key={id}
                product={products.find((p) => p.id === id)!}
                index={index}
              />
            ),
          )}
        </div>
      </section>
      <section className={styles.section}>
        <div className={styles.heading}>
          <div>
            <h2>Browse by occasion</h2>
            <p>Explore sample arrangements by occasion.</p>
          </div>
        </div>
        <div className={styles.occasionGrid}>
          {occasions.map((occasion) => (
            <Link
              key={occasion.name}
              href={`/shop?occasion=${encodeURIComponent(occasion.name)}`}
              className={styles.occasion}
            >
              <Image
                src={`/images/${occasion.image}.png`}
                alt=""
                fill
                sizes="(max-width: 700px) 50vw, 33vw"
              />
              <span>{occasion.name}</span>
            </Link>
          ))}
        </div>
      </section>
      <section className={styles.branches}>
        <div>
          <h2>Visit our branches</h2>
          <p>
            Visit our branches or get in touch about an arrangement. Delivery
            and pickup are subject to confirmation.
          </p>
        </div>
        <div className={styles.branchLinks}>
          <Link href="/contact">
            <span>
              <MapPin size={18} aria-hidden="true" /> Valenzuela
            </span>
            <Arrow />
          </Link>
          <Link href="/contact">
            <span>
              <MapPin size={18} aria-hidden="true" /> Angeles, Pampanga
            </span>
            <Arrow />
          </Link>
        </div>
      </section>
    </div>
  );
}
