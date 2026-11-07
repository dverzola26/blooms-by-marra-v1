"use client";
import { useState } from "react";
import Link from "next/link";
import { useStore } from "@/components/store";
import styles from "../cart/flow.module.css";
import {
  checkoutSchema,
  cities,
  priceCart,
  money,
  manilaDate,
  fulfillmentReview,
  type Branch,
} from "@/lib/commerce";
export default function Checkout() {
  const { lines } = useStore();
  const [mode, setMode] = useState<"delivery" | "pickup">("delivery");
  const [branch, setBranch] = useState<Branch>("valenzuela");
  const [city, setCity] = useState("Valenzuela");
  const [payment, setPayment] = useState("GCash");
  const [errors, setErrors] = useState<string[]>([]);
  const [result, setResult] = useState("");
  let pricing: ReturnType<typeof priceCart> | undefined;
  let pricingError = "";
  try {
    pricing = priceCart(lines, mode, branch, city);
  } catch (e) {
    pricingError = (e as Error).message;
  }
  if (!lines.length)
    return (
      <section className={`section empty ${styles.flow}`}>
        <h1>Your demo cart is empty</h1>
        <p>Add a sample arrangement to try checkout.</p>
        <Link className="button" href="/shop">
          Browse flowers
        </Link>
      </section>
    );
  return (
    <section className={`section ${styles.flow}`}>
      <header className={styles.heading}>
        <h1>Demo checkout</h1>
        <p>Use fictional contact details to try the checkout form.</p>
      </header>
      <p className={styles.demoNotice}>
        Demo only — no order or payment will be submitted. Nothing is sent to a store or payment provider.
      </p>
      {result ? (
        <div className="confirmation" role="status">
          <h2>Demo request reviewed</h2>
          <p>{result}</p>
          <p>
            No order was saved, no stock reserved, no payment requested and no
            notification sent. Your contact details were not stored.
          </p>
          <div className="actions">
            <button className="button" onClick={() => setResult("")}>
              Edit demo request
            </button>
            <Link className="text-link" href="/status">
              Explore status guidance
            </Link>
          </div>
        </div>
      ) : (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            const data = Object.fromEntries(new FormData(e.currentTarget));
            const parsed = checkoutSchema.safeParse({
              ...data,
              mode,
              payment,
              consent: data.consent === "on",
            });
            const errs = parsed.success
              ? []
              : parsed.error.issues.map(
                  (i) => `${i.path.join(" ")}: ${i.message}`,
                );
            if (pricingError) errs.push(pricingError);
            if (String(data.date) < manilaDate(new Date()))
              errs.push("Choose today or a future date in Philippine time.");
            setErrors(errs);
            if (!errs.length) {
              const state = fulfillmentReview(
                mode,
                String(data.date),
                undefined,
                new Date(),
                true,
                pricing?.quoted,
              );
              setResult(
                state === "needs_review"
                  ? "Preview status: staff approval / quotation required. Availability, timing and any final amount need confirmation."
                  : "Preview status: pending staff confirmation. Payment remains unpaid and fulfillment remains unconfirmed.",
              );
            }
          }}
        >
          <div className="checkout-layout">
            <div>
              {errors.length > 0 && (
                <div className="error" role="alert" tabIndex={-1}>
                  <strong>Please check these details:</strong>
                  <ul>
                    {errors.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                </div>
              )}
              <fieldset>
                <legend>Delivery or pickup</legend>
                <div className="segmented">
                  {(["delivery", "pickup"] as const).map((v) => (
                    <button
                      type="button"
                      className={mode === v ? "selected" : ""}
                      aria-pressed={mode === v}
                      key={v}
                      onClick={() => {
                        setMode(v);
                        if (v === "delivery" && payment === "Cash")
                          setPayment("GCash");
                      }}
                    >
                      {v === "delivery" ? "Delivery" : "Store pickup"}
                    </button>
                  ))}
                </div>
                <div className="two-col">
                  <label>
                    Branch
                    <select
                      value={branch}
                      onChange={(e) => {
                        const b = e.target.value as Branch;
                        setBranch(b);
                        setCity(cities[b][0]);
                      }}
                    >
                      <option value="valenzuela">
                        Valenzuela · Metro Manila
                      </option>
                      <option value="angeles">Angeles · Pampanga</option>
                    </select>
                  </label>
                  {mode === "delivery" && (
                    <label>
                      Destination city
                      <select
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                      >
                        {cities[branch].map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                        <option>Outside listed area</option>
                      </select>
                    </label>
                  )}
                  <label>
                    Preferred date (Asia/Manila)
                    <input
                      name="date"
                      type="date"
                      min={manilaDate(new Date())}
                      required
                    />
                  </label>
                  <label>
                    Preferred window
                    <select name="window">
                      <option>Morning</option>
                      <option>Afternoon</option>
                    </select>
                  </label>
                </div>
                <p className="muted">
                  Dates and windows are requests, subject to branch
                  availability. Same-day delivery may require approval. Pickup
                  follows separate branch rules.
                </p>
              </fieldset>
              <fieldset>
                <legend>Contact and recipient</legend>
                <div className="two-col">
                  <label>
                    Your name
                    <input
                      name="customer"
                      autoComplete="name"
                      required
                      maxLength={100}
                    />
                  </label>
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                    />
                  </label>
                  <label>
                    Mobile number
                    <input
                      name="phone"
                      type="tel"
                      placeholder="09XXXXXXXXX"
                      required
                    />
                  </label>
                  <label>
                    {mode === "delivery" ? "Recipient" : "Pickup contact"} name
                    <input name="recipient" required maxLength={100} />
                  </label>
                </div>
                {mode === "delivery" && (
                  <label>
                    Complete recipient address
                    <textarea
                      name="address"
                      required
                      maxLength={500}
                      placeholder="House / unit, street, barangay, landmark"
                    />
                  </label>
                )}
                {mode === "pickup" && (
                  <input type="hidden" name="address" value="" />
                )}
                <label>
                  Recipient mobile number
                  <input
                    name="recipientPhone"
                    type="tel"
                    pattern="(\+63|0)9[0-9]{9}"
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </label>
                <label>
                  Special instructions
                  <textarea name="instructions" maxLength={500} />
                </label>
              </fieldset>
              <fieldset>
                <legend>Payment preference</legend>
                <label>
                  Preferred method
                  <select
                    value={payment}
                    onChange={(e) => setPayment(e.target.value)}
                  >
                    {[
                      "GCash",
                      "Maya",
                      "GoTyme",
                      "QR Ph",
                      ...(mode === "pickup" ? ["Cash"] : []),
                    ].map((v) => (
                      <option key={v}>{v}</option>
                    ))}
                  </select>
                </label>
                <p>
                  No cash on delivery. Payment instructions are unavailable in
                  demo mode. Deposits require explicit owner approval; a
                  screenshot never verifies payment.
                </p>
              </fieldset>
              <fieldset>
                <legend>Review before continuing</legend>
                <label className="checkbox">
                  <input type="checkbox" name="consent" required />
                  <span>
                    I understand this is a demo and that real requests require
                    inventory, fulfillment and payment confirmation. I have read
                    the <Link href="/policies">draft policy summaries</Link>.
                  </span>
                </label>
              </fieldset>
            </div>
            <aside className="summary">
              <h2>Demo order summary</h2>
              {pricingError ? (
                <p className="error" role="alert">
                  {pricingError}
                </p>
              ) : (
                <>
                  <div className="summary-row">
                    <span>Sample subtotal</span>
                    <strong>{money(pricing!.subtotal)}</strong>
                  </div>
                  <div className="summary-row">
                    <span>
                      {mode === "pickup"
                        ? "Pickup"
                        : pricing!.included
                          ? "Delivery included"
                          : "Sample delivery fee"}
                    </span>
                    <strong>{money(pricing!.fee)}</strong>
                  </div>
                  <div className="summary-row total">
                    <span>Sample total</span>
                    <strong>
                      {pricing!.total === null
                        ? "Quote needed"
                        : money(pricing!.total)}
                    </strong>
                  </div>
                </>
              )}
              <p>
                These are sample prices and are not available for purchase.
                Branches cannot be combined automatically.
              </p>
              <button className="button full" type="submit">
                Review demo request
              </button>
              <p className="muted">No backend order or payment is created.</p>
            </aside>
          </div>
        </form>
      )}
    </section>
  );
}
