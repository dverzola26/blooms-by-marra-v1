import { OrderTracking } from "@/components/order-tracking";
export default function Status() {
  return (
    <section className="section info-page">
      <p className="eyebrow">ORDER JOURNEY</p>
      <h1>Every step, with care.</h1>
      <p>
        Open the private link supplied by staff to view a staging request.
        Without a valid token, no order details are shown. Live orders remain
        disabled.
      </p>
      <OrderTracking />
      <ol className="timeline">
        {[
          ["Request received", "Pending staff review, not an approved order."],
          [
            "Details confirmed",
            "Inventory, amount and fulfillment are reviewed.",
          ],
          [
            "Payment review",
            "An uploaded proof remains unverified until checked by staff.",
          ],
          [
            "Flowers in preparation",
            "Preparation begins only after required approvals.",
          ],
          [
            "Ready for your moment",
            "Pickup or delivery is recorded separately from payment.",
          ],
        ].map(([h, p]) => (
          <li key={h}>
            <h2>{h}</h2>
            <p>{p}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
