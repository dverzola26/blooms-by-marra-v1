"use client";
import Link from "next/link";
import { useState } from "react";
import { Bouquet, useStore, Arrow } from "./store";
import { money, productImages, type Product } from "@/lib/commerce";
export function ProductDetail({ product: p }: { product: Product }) {
  const { add } = useStore();
  const [message, setMessage] = useState("");
  const [added, setAdded] = useState(false);
  return (
    <section className="section">
      <Link className="text-link" href="/shop">
        ← Back to the collection
      </Link>
      <div className="detail-layout">
        <Bouquet src={productImages[p.id]} priority />
        <div>
          <p className="eyebrow">DEMO ARRANGEMENT · {p.occasion}</p>
          <h1>{p.name}</h1>
          <p className="detail-price">
            {p.custom ? "Quote required" : money(p.price)}{" "}
            <small>{p.custom ? "" : "sample price only"}</small>
          </p>
          <p>
            A floral concept for a thoughtful gesture. Names, prices and imagery
            are illustrative; the approved catalog will define the actual
            flowers, sizes and availability.
          </p>
          <p className="notice">
            Demo branch:{" "}
            {p.branch === "angeles" ? "Angeles, Pampanga" : "Valenzuela"}.{" "}
            {p.included.length
              ? "Sample delivery inclusion: Valenzuela only."
              : "Delivery fees are calculated separately in the rehearsal."}
          </p>
          <label>
            A little note from you
            <textarea
              maxLength={300}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What would you like the card to say?"
            />
          </label>
          <small>
            {message.length}/300 characters · Saved in this browser with your
            demo cart
          </small>
          <button
            className="button full"
            onClick={() => {
              add(p.id, message);
              setAdded(true);
            }}
          >
            {added ? "Added — add another" : "Add to demo cart"} <Arrow />
          </button>
          {added && (
            <p role="status">
              A thoughtful choice.{" "}
              <Link href="/cart">View your demo cart →</Link>
            </p>
          )}
          <details>
            <summary>Availability & personal touches</summary>
            <p>
              Final stock, variants and add-ons await the owner-approved
              catalog. Custom arrangements need a staff-confirmed quote.
            </p>
          </details>
          <details>
            <summary>Delivery & pickup</summary>
            <p>
              Delivery availability is reviewed per order. Pickup has no
              delivery fee and does not use the same-day delivery cutoff.
            </p>
          </details>
        </div>
      </div>
    </section>
  );
}
