import { OrderTracking } from "@/components/order-tracking";
import styles from "@/components/info-layout.module.css";

export default function Status() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>Request status</h1>
          <p>Use the private link from staff to check a test request.</p>
        </div>
      </div>
      <section className={`${styles.content} ${styles.statusContent}`}>
        <div className={styles.statusNote}>
          <p>Open your private link to view a staging request. Without a valid token, no order details are shown. Live orders remain disabled.</p>
        </div>
        <OrderTracking />
        <div className={styles.journey}>
          <h2>Request and payment steps</h2>
          <p>These are general steps, not the status of a particular request.</p>
          <ol className={styles.timeline}>
            {[
              ["Request received", "Pending staff review, not an approved order."],
              ["Details confirmed", "Inventory, amount and fulfillment are reviewed."],
              ["Payment review", "An uploaded proof remains unverified until checked by staff."],
              ["Flowers in preparation", "Preparation begins only after required approvals."],
              ["Pickup or delivery", "Pickup or delivery is recorded separately from payment."],
            ].map(([heading, description]) => (
              <li key={heading}><h3>{heading}</h3><p>{description}</p></li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
