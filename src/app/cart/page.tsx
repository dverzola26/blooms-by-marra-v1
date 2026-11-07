"use client";
import Link from "next/link";
import { useStore, Quantity, Bouquet, Arrow } from "@/components/store";
import { products, productImages, money } from "@/lib/commerce";
import styles from "./flow.module.css";
export default function Cart() {
  const { lines, quantity, clear } = useStore();
  return (
    <section className={`section ${styles.flow}`}>
      <header className={styles.heading}>
        <h1>Your demo cart</h1>
        <p>A sample selection to explore the checkout experience.</p>
      </header>
      <p className={styles.demoNotice}>
        Demo only — these arrangements are illustrative. No real order or payment can be made.
      </p>
      {!lines.length ? (
        <div className="empty">
          <h2>Your demo cart is empty</h2>
          <p>Choose a sample arrangement to try checkout.</p>
          <Link className="button" href="/shop">
            Explore flowers <Arrow />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            <h2 className={styles.itemsHeading}>Your selected arrangements ({lines.reduce((sum, line) => sum + line.quantity, 0)})</h2>
            {lines.map((l) => {
              const p = products.find((p) => p.id === l.id)!;
              return (
                <article className="cart-item" key={l.id}>
                  <Link href={`/shop/${p.id}`}>
                    <Bouquet src={productImages[p.id]} />
                  </Link>
                  <div>
                    <span className={styles.sampleBadge}>SAMPLE · {p.branch === "valenzuela" ? "Valenzuela" : "Angeles"}</span>
                    <Link href={`/shop/${p.id}`}>
                      <h3>{p.name}</h3>
                    </Link>
                    <p>{p.custom ? "Sample quote required" : `${money(p.price)} sample price`}</p>
                    {l.message && <p className="muted">Card: {l.message}</p>}
                    <Quantity id={l.id} value={l.quantity} />
                    <button
                      className="text-link remove"
                      onClick={() => quantity(l.id, 0)}
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
            <button className="text-link" onClick={clear}>
              Clear demo cart
            </button>
          </div>
          <aside className="summary">
            <h2>Demo order summary</h2>
            <div className="summary-row">
              <span>Sample subtotal</span>
              <strong>
                {money(
                  lines.reduce(
                    (s, l) =>
                      s +
                      products.find((p) => p.id === l.id)!.price * l.quantity,
                    0,
                  ),
                )}
              </strong>
            </div>
            <p>
              Delivery inclusion and fees are checked by branch and city at
              checkout. Custom arrangements require a quote.
            </p>
            <Link className="button full" href="/checkout">
              Try demo checkout <Arrow />
            </Link>
            <p className="muted">
              No real order will be submitted. No payment will be taken.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}
