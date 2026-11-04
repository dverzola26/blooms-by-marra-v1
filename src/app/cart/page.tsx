"use client";
import Link from "next/link";
import { useStore, Quantity, Bouquet, Arrow } from "@/components/store";
import { products, productImages, money } from "@/lib/commerce";
export default function Cart() {
  const { lines, quantity, clear } = useStore();
  return (
    <section className="section">
      <p className="eyebrow">A LITTLE SOMETHING, CHOSEN WITH LOVE</p>
      <h1>Your demo flower bag</h1>
      {!lines.length ? (
        <div className="empty">
          <h2>A little room for something lovely.</h2>
          <p>Your demo cart is empty.</p>
          <Link className="button" href="/shop">
            Explore flowers <Arrow />
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div>
            {lines.map((l) => {
              const p = products.find((p) => p.id === l.id)!;
              return (
                <article className="cart-item" key={l.id}>
                  <Link href={`/shop/${p.id}`}>
                    <Bouquet src={productImages[p.id]} />
                  </Link>
                  <div>
                    <span className="eyebrow">DEMO · {p.branch}</span>
                    <Link href={`/shop/${p.id}`}>
                      <h3>{p.name}</h3>
                    </Link>
                    <p>{p.custom ? "Quote required" : money(p.price)}</p>
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
            <h2>Your thoughtful selection</h2>
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
              Rehearse checkout <Arrow />
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
