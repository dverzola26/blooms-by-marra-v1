"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import {
  ShoppingBag,
  Menu,
  X,
  ArrowRight,
  Truck,
  MapPin,
  Clock,
  Search,
  Minus,
  Plus,
  Store,
  Heart,
} from "lucide-react";
import {
  products,
  productImages,
  money,
  type Line,
  type Product,
} from "@/lib/commerce";
type StoreState = {
  lines: Line[];
  add: (id: string, message?: string) => void;
  quantity: (id: string, n: number) => void;
  clear: () => void;
};
const Context = createContext<StoreState | null>(null);
export function useStore() {
  return useContext(Context)!;
}
export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = JSON.parse(
          localStorage.getItem("blooms-demo-cart") || "[]",
        );
        if (Array.isArray(raw))
          setLines(
            raw.filter(
              (l) =>
                products.some((p) => p.id === l.id) &&
                Number.isInteger(l.quantity) &&
                l.quantity > 0 &&
                l.quantity <= 20 &&
                typeof l.message === "string",
            ),
          );
      } catch {}
      setReady(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (ready) localStorage.setItem("blooms-demo-cart", JSON.stringify(lines));
  }, [lines, ready]);
  return (
    <Context.Provider
      value={{
        lines,
        add: (id, message = "") =>
          setLines((ls) =>
            ls.some((l) => l.id === id)
              ? ls.map((l) =>
                  l.id === id
                    ? {
                        ...l,
                        quantity: Math.min(20, l.quantity + 1),
                        message: message || l.message,
                      }
                    : l,
                )
              : [...ls, { id, quantity: 1, message }],
          ),
        quantity: (id, n) =>
          setLines((ls) =>
            n <= 0
              ? ls.filter((l) => l.id !== id)
              : ls.map((l) =>
                  l.id === id ? { ...l, quantity: Math.min(20, n) } : l,
                ),
          ),
        clear: () => setLines([]),
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function Shell({ children }: { children: React.ReactNode }) {
  const { lines } = useStore();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="announcement">
        <span>
          <Truck size={17} /> Delivery subject to confirmation
        </span>
        <span>
          <Store size={16} /> Valenzuela & Angeles branches
        </span>
        <span>
          <Clock size={16} /> Inquiries & pickup
        </span>
      </div>
      <header>
        <Link href="/" className="wordmark">
          <Image src="/images/botanical.png" alt="" width={42} height={58} />
          <span>
            BLOOMS BY
            <br />
            MARRA<small>F L O W E R S H O P</small>
          </span>
        </Link>
        <nav className={open ? "open" : ""} aria-label="Main navigation">
          {[
            ["/", "Home"],
            ["/shop", "Shop flowers"],
            ["/delivery", "Delivery & pickup"],
            ["/about", "About"],
            ["/faq", "FAQ"],
            ["/contact", "Contact"],
          ].map(([url, text]) => (
            <Link
              key={text}
              href={url}
              aria-current={pathname === url ? "page" : undefined}
              onClick={() => setOpen(false)}
            >
              {text}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/shop" aria-label="Search flowers">
            <Search size={21} />
          </Link>
          <Link
            href="/cart"
            className="cart-link"
            aria-label={`Cart, ${lines.reduce((s, l) => s + l.quantity, 0)} items`}
          >
            <ShoppingBag size={22} />
            <b>{lines.reduce((s, l) => s + l.quantity, 0)}</b>
          </Link>
          <button
            className="icon mobile-menu"
            aria-expanded={open}
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <div className="demo-strip">
        DEMO PREVIEW · Illustrative arrangements & sample prices · Live orders
        and payments disabled
      </div>
      <main id="main">{children}</main>
      <footer>
        <div>
          <div className="footer-brand">BLOOMS BY MARRA</div>
          <p className="muted">Your everyday florist for every occasion.</p>
        </div>
        <div>
          <h3>Explore</h3>
          <Link href="/shop">The demo collection</Link>
          <Link href="/delivery">Delivery & pickup</Link>
          <Link href="/status">Order status</Link>
        </div>
        <div>
          <h3>Here to help</h3>
          <Link href="/contact">Contact & branches</Link>
          <Link href="/faq">Frequently asked questions</Link>
          <Link href="/policies">Policies & privacy</Link>
          <Link href="/admin">Owner workspace</Link>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Blooms by Marra{" "}
          <span>Demo storefront</span>
        </div>
      </footer>
    </>
  );
}
export function Bouquet({
  className = "",
  priority = false,
  src = "/images/mixed.png",
  decorative = false,
}: {
  className?: string;
  priority?: boolean;
  src?: string;
  decorative?: boolean;
}) {
  return (
    <div className={`bouquet ${className}`}>
      <Image
        src={src}
        alt={
          decorative
            ? ""
            : "Illustrative demo bouquet; not actual shop inventory"
        }
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1000px) 25vw, 20vw"
        priority={priority}
      />
      {!decorative && <span className="image-note">DEMO IMAGE</span>}
    </div>
  );
}
export function ProductCard({
  product: p,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const { add } = useStore();
  const [added, setAdded] = useState(false);
  const [saved, setSaved] = useState(false);
  return (
    <article className="product-card">
      <Link
        href={`/shop/${p.id}`}
        className={`product-image tone-${index % 4}`}
      >
        <Bouquet src={productImages[p.id]} />
        <span className="badge">DEMO</span>
      </Link>
      <button
        className="save-flower"
        aria-label={`${saved ? "Unsave" : "Save"} ${p.name} for this visit`}
        aria-pressed={saved}
        onClick={() => setSaved(!saved)}
      >
        <Heart size={19} fill={saved ? "currentColor" : "none"} />
      </button>
      <div className="product-meta">
        <span>{p.occasion}</span>
        <span>{p.branch === "angeles" ? "Angeles" : "Valenzuela"}</span>
      </div>
      <Link href={`/shop/${p.id}`}>
        <h3>{p.name}</h3>
      </Link>
      <p className="price">
        {p.custom ? "Quote preview" : money(p.price)}{" "}
        <small>{p.custom ? "" : "sample price"}</small>
      </p>
      <button
        className="add-button"
        onClick={() => {
          add(p.id);
          setAdded(true);
        }}
      >
        <ShoppingBag size={16} />
        {added ? "Added to demo cart" : "Add to demo cart"}
      </button>
      <span className="sr-only" role="status">
        {added ? `${p.name} added` : ""}
      </span>
    </article>
  );
}
export function Trust() {
  return (
    <div className="trust">
      {[
        [Truck, "Delivery Requests", "Subject to confirmation"],
        [Clock, "Shop Inquiries", "Our team is here to help"],
        [Store, "Store Pickup", "Choose your branch"],
        [MapPin, "2 Branches", "Valenzuela & Angeles"],
      ].map(([Icon, title, sub]) => {
        const I = Icon as typeof Truck;
        return (
          <div key={String(title)}>
            <I size={28} strokeWidth={1.2} />
            <span>
              <strong>{String(title)}</strong>
              <small>{String(sub)}</small>
            </span>
          </div>
        );
      })}
    </div>
  );
}
export function Quantity({ id, value }: { id: string; value: number }) {
  const { quantity } = useStore();
  return (
    <div className="quantity">
      <button
        aria-label="Decrease quantity"
        onClick={() => quantity(id, value - 1)}
      >
        <Minus size={14} />
      </button>
      <span>{value}</span>
      <button
        aria-label="Increase quantity"
        disabled={value >= 20}
        onClick={() => quantity(id, value + 1)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}
export function Arrow() {
  return <ArrowRight size={17} />;
}
