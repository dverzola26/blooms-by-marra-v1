"use client";
import { useEffect, useState } from "react";
type Status = {
  reference: string;
  request: string;
  payment: string;
  fulfillment: string;
  mode: string;
  date: string;
};
const requestLabels: Record<string, string> = {
  submitted: "Pending staff review",
  needs_review: "Staff approval needed",
  quote_pending: "Quotation in review",
  awaiting_payment: "Awaiting payment",
  cancelled_before_payment: "Cancelled before payment",
  reschedule_requested: "Reschedule requested",
  issue_reported: "Concern under review",
};
const paymentLabels: Record<string, string> = {
  unpaid: "Not yet paid",
  submitted: "Proof awaiting review",
  verified: "Verified by staff",
  rejected: "Proof needs attention",
};
const fulfillmentLabels: Record<string, string> = {
  unconfirmed: "Awaiting staff confirmation",
  confirmed: "Confirmed by staff",
  preparing: "Flowers in preparation",
  ready_for_pickup: "Ready for pickup",
  out_for_delivery: "Out for delivery",
  completed: "Completed",
};
export function OrderTracking() {
  const [status, setStatus] = useState<Status | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const orderId = hash.get("id");
    const token = hash.get("token");
    if (!orderId || !token) return;
    let active = true;
    fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, token }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!active) return;
        history.replaceState(null, "", window.location.pathname);
        if (!r.ok) setMessage(data.error);
        else setStatus(data.status);
      })
      .catch(() => {
        if (active)
          setMessage(
            "Could not check this link. Retry using the original private link.",
          );
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      {message && (
        <p role="alert" className="notice">
          {message}
        </p>
      )}
      {status && (
        <article className="notice">
          <h2>Staging request {status.reference.slice(0, 8)}</h2>
          <p>This is a test request, not a real transaction.</p>
          <dl>
            <dt>Request</dt>
            <dd>{requestLabels[status.request] || "Staff review pending"}</dd>
            <dt>Payment</dt>
            <dd>{paymentLabels[status.payment] || "Staff review pending"}</dd>
            <dt>Fulfillment</dt>
            <dd>
              {fulfillmentLabels[status.fulfillment] || "Staff review pending"}
            </dd>
            <dt>Preferred date</dt>
            <dd>{status.date}</dd>
          </dl>
          <p>
            Payment proof does not automatically verify payment. Availability
            and fulfillment require staff approval.
          </p>
        </article>
      )}
    </>
  );
}
