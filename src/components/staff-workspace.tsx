"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { money, manilaDate } from "@/lib/commerce";
import type { StageOrder } from "@/lib/staging";
type Branch = { id: string; name: string; cutoff: string };
type Product = {
  id: string;
  name: string;
  price_centavos: number | null;
  custom_quote: boolean;
  branch_inventory: { branch_id: string }[];
};
type Zone = { id: string; branch_id: string; city: string };
type Detail = {
  order: StageOrder;
  payments: {
    id: string;
    state: string;
    amount_centavos: number;
    payment_proof_files: { id: string }[];
  }[];
  events: {
    id: string;
    created_at: string;
    new_state: { request: string; payment: string; fulfillment: string };
  }[];
};
async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });
  const result = await response.json();
  if (!response.ok) throw Error(result.error || "Request failed.");
  return result;
}
export function StaffWorkspace({
  role,
  branches,
  products,
  zones,
}: {
  role: "owner" | "staff";
  branches: Branch[];
  products: Product[];
  zones: Zone[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<StageOrder[]>([]);
  const [detail, setDetail] = useState<Detail | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState("");
  const [branch, setBranch] = useState(branches[0]?.id || "");
  const [mode, setMode] = useState("delivery");
  const [key, setKey] = useState("");
  const [proofUrl, setProofUrl] = useState("");
  useEffect(() => {
    let active = true;
    api("/api/staging/orders")
      .then((r) => {
        if (active) setOrders(r.orders);
      })
      .catch((e) => {
        if (active) setNotice(e.message);
      });
    return () => {
      active = false;
    };
  }, []);
  async function refresh(id?: string) {
    const r = await api("/api/staging/orders");
    setOrders(r.orders);
    if (id) setDetail(await api(`/api/staging/orders/${id}`));
  }
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await task();
    } catch (e) {
      setNotice((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  const eligible = products.filter((p) =>
    p.branch_inventory.some((i) => i.branch_id === branch),
  );
  async function change(action: string, extra: Record<string, unknown> = {}) {
    if (!detail) return;
    await run(async () => {
      await api(`/api/staging/orders/${detail.order.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          action,
          version: detail.order.version,
          ...extra,
        }),
      });
      await refresh(detail.order.id);
      setNotice("Test order updated.");
    });
  }
  return (
    <section className="section">
      <p className="eyebrow">PRIVATE STAGING · {role} ACCESS</p>
      <div className="staff-heading">
        <h1>Behind the blooms.</h1>
        <button
          className="text-link"
          onClick={() =>
            run(async () => {
              await api("/api/auth/logout", { method: "POST" });
              router.replace("/admin/login");
              router.refresh();
            })
          }
        >
          Sign out
        </button>
      </div>
      <p className="notice">
        Test data only. No live commerce, payment collection, stock reservations
        or customer notifications. Branch staff see only their assigned records.
        Sessions refresh automatically while valid. Sign in again if your
        session is revoked or expires under the project’s Auth policy.
      </p>
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      {role === "owner" && (
        <details className="staff-form">
          <summary>Staging branch settings & inventory</summary>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(async () => {
                await api("/api/staging/operations", {
                  method: "POST",
                  body: JSON.stringify({
                    kind: "cutoff",
                    branch: f.get("branch"),
                    cutoff: f.get("cutoff"),
                  }),
                });
                setNotice(
                  "Staging cutoff saved. No public delivery claim was changed.",
                );
                router.refresh();
              });
            }}
          >
            <label>
              Branch
              <select name="branch">
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Internal cutoff · Asia/Manila
              <input type="time" name="cutoff" required />
            </label>
            <button className="button" disabled={busy}>
              Save staging cutoff
            </button>
          </form>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = new FormData(e.currentTarget);
              run(async () => {
                await api("/api/staging/operations", {
                  method: "POST",
                  body: JSON.stringify({
                    kind: "inventory",
                    branch: f.get("branch"),
                    product: f.get("product"),
                    available: f.get("available") === "on",
                    quantity:
                      f.get("quantity") === ""
                        ? null
                        : Number(f.get("quantity")),
                  }),
                });
                setNotice("Staging inventory saved.");
              });
            }}
          >
            <label>
              Branch
              <select name="branch">
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Demo product
              <select name="product">
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Test quantity (blank for untracked)
              <input name="quantity" type="number" min="0" max="10000" />
            </label>
            <label className="checkbox">
              <input name="available" type="checkbox" />
              <span>Available in this test branch</span>
            </label>
            <button className="button" disabled={busy}>
              Save staging inventory
            </button>
          </form>
        </details>
      )}
      <div className="staff-grid">
        <div>
          <h2>Create a test request</h2>
          {!branches.length ? (
            <p>
              No staging branches are assigned. Ask the owner to complete setup.
            </p>
          ) : (
            <form
              className="staff-form"
              onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget);
                const requestKey = key || crypto.randomUUID();
                setKey(requestKey);
                run(async () => {
                  const contact = {
                    customer: form.get("customer"),
                    email: form.get("email"),
                    phone: form.get("phone"),
                    recipient: form.get("recipient"),
                    recipientPhone: form.get("recipientPhone"),
                    address: mode === "delivery" ? form.get("address") : "",
                    mode,
                    payment: form.get("payment"),
                    date: form.get("date"),
                    window: form.get("window"),
                    consent: form.get("fictional") === "on",
                  };
                  const r = await api("/api/staging/orders", {
                    method: "POST",
                    body: JSON.stringify({
                      idempotencyKey: requestKey,
                      branchId: branch,
                      zoneId:
                        mode === "delivery" ? form.get("zone") : undefined,
                      lines: [
                        {
                          productId: form.get("product"),
                          quantity: Number(form.get("quantity")),
                          message: String(form.get("message") || ""),
                        },
                      ],
                      contact,
                      fictionalDetails: form.get("fictional") === "on",
                    }),
                  });
                  setKey("");
                  await refresh(r.orderId);
                  setNotice("Test request saved. It is not a confirmed order.");
                });
              }}
            >
              <label>
                Staging branch
                <select
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    setKey("");
                  }}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Demo arrangement
                <select key={branch} name="product" required>
                  {eligible.map((p) => (
                    <option value={p.id} key={p.id}>
                      {p.name} ·{" "}
                      {p.custom_quote
                        ? "Quote required"
                        : money(p.price_centavos || 0)}
                    </option>
                  ))}
                </select>
              </label>
              <div className="two-col">
                <label>
                  Quantity
                  <input
                    name="quantity"
                    type="number"
                    defaultValue="1"
                    min="1"
                    max="20"
                    required
                  />
                </label>
                <label>
                  Fulfillment
                  <select
                    value={mode}
                    onChange={(e) => {
                      setMode(e.target.value);
                      setKey("");
                    }}
                  >
                    <option value="delivery">Delivery</option>
                    <option value="pickup">Pickup</option>
                  </select>
                </label>
              </div>
              {mode === "delivery" && (
                <>
                  <label>
                    City
                    <select key={branch} name="zone" required>
                      {zones
                        .filter((z) => z.branch_id === branch)
                        .map((z) => (
                          <option value={z.id} key={z.id}>
                            {z.city}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Fictional address
                    <textarea
                      name="address"
                      defaultValue="123 Fictional Street, Demo Barangay"
                      required
                      maxLength={500}
                    />
                  </label>
                </>
              )}
              <div className="two-col">
                <label>
                  Preferred date
                  <input
                    name="date"
                    type="date"
                    required
                    min={manilaDate(new Date())}
                  />
                </label>
                <label>
                  Window
                  <select name="window">
                    <option>Morning</option>
                    <option>Afternoon</option>
                  </select>
                </label>
                <label>
                  Sender name
                  <input
                    name="customer"
                    defaultValue="DEMO Sender"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Sender email
                  <input
                    name="email"
                    type="email"
                    defaultValue="demo@example.com"
                    required
                  />
                </label>
                <label>
                  Sender mobile
                  <input name="phone" defaultValue="09123456789" required />
                </label>
                <label>
                  Recipient name
                  <input
                    name="recipient"
                    defaultValue="DEMO Recipient"
                    maxLength={100}
                    required
                  />
                </label>
                <label>
                  Recipient mobile
                  <input
                    name="recipientPhone"
                    defaultValue="09123456789"
                    required
                  />
                </label>
                <label>
                  Payment preference
                  <select name="payment" key={mode}>
                    {[
                      "GCash",
                      "Maya",
                      "GoTyme",
                      "MariBank",
                      ...(mode === "pickup" ? ["Cash"] : []),
                    ].map((p) => (
                      <option key={p}>{p}</option>
                    ))}
                  </select>
                </label>
              </div>
              <label>
                Gift message
                <textarea name="message" maxLength={300} />
              </label>
              <label className="checkbox">
                <input name="fictional" type="checkbox" required />
                <span>
                  I am using fictional test details, not real customer
                  information.
                </span>
              </label>
              <div className="actions">
                <button className="button" disabled={busy || !eligible.length}>
                  {busy ? "Working…" : "Save staging request"}
                </button>
                <button
                  type="button"
                  className="text-link"
                  onClick={() => setKey("")}
                >
                  Start a new request key
                </button>
              </div>
              <p className="muted">
                Retries use the same request key. If you edit details after a
                failed attempt, start a new key.
              </p>
            </form>
          )}
        </div>
        <div>
          <div className="staff-heading">
            <h2>Staging queue</h2>
            <button
              className="text-link"
              disabled={busy}
              onClick={() => run(() => refresh())}
            >
              Refresh
            </button>
          </div>
          {!orders.length && <p>No test requests yet.</p>}
          <div className="staff-order-list">
            {orders.map((o) => (
              <button
                key={o.id}
                className="staff-order"
                onClick={() =>
                  run(async () => {
                    setDetail(await api(`/api/staging/orders/${o.id}`));
                    setTracking("");
                    setProofUrl("");
                  })
                }
              >
                <strong>
                  {o.id.slice(0, 8)} · {o.mode}
                </strong>
                <span>
                  {o.preferred_date} · {o.request_state}
                </span>
                <span>
                  {o.payment_state} / {o.fulfillment_state}
                </span>
              </button>
            ))}
          </div>
          {detail && (
            <article className="staff-detail">
              <h2>Test request {detail.order.id.slice(0, 8)}</h2>
              <dl>
                <dt>Request</dt>
                <dd>{detail.order.request_state}</dd>
                <dt>Payment</dt>
                <dd>{detail.order.payment_state}</dd>
                <dt>Fulfillment</dt>
                <dd>{detail.order.fulfillment_state}</dd>
                <dt>Sample total</dt>
                <dd>
                  {detail.order.total_centavos === null
                    ? "Quote required"
                    : money(detail.order.total_centavos)}
                </dd>
                <dt>Sample delivery</dt>
                <dd>{money(detail.order.fee_centavos || 0)}</dd>
              </dl>
              <div className="staff-actions">
                {role === "owner" &&
                  detail.order.request_state === "quote_pending" && (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        change("quote", {
                          amount: Number(
                            new FormData(e.currentTarget).get("amount"),
                          ),
                        });
                      }}
                    >
                      <label>
                        Approved sample total (centavos, including delivery)
                        <input
                          name="amount"
                          type="number"
                          min="1"
                          max="100000000"
                          required
                        />
                      </label>
                      <button className="button" disabled={busy}>
                        Record staging quote
                      </button>
                    </form>
                  )}
                {role === "owner" &&
                  ["submitted", "needs_review"].includes(
                    detail.order.request_state,
                  ) && (
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() => change("approve")}
                    >
                      Approve test details
                    </button>
                  )}
                {role === "owner" &&
                  detail.order.request_state === "awaiting_payment" &&
                  detail.order.fulfillment_state === "unconfirmed" && (
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() => change("confirm")}
                    >
                      Confirm test fulfillment
                    </button>
                  )}
                {[
                  "preparing",
                  "ready_for_pickup",
                  "out_for_delivery",
                  "completed",
                ].map((action) => (
                  <button
                    key={action}
                    className="add-button"
                    disabled={busy}
                    onClick={() => change(action)}
                  >
                    {action.replaceAll("_", " ")}
                  </button>
                ))}
              </div>
              <p className="muted">
                Only permitted transitions succeed. Confirmation requires owner
                approval and verified payment, with a cash-on-pickup exception.
                Completion always requires recorded payment.
              </p>
              {detail.order.request_state === "awaiting_payment" &&
                detail.order.payment_method !== "Cash" && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const form = new FormData(e.currentTarget);
                      form.set("orderId", detail.order.id);
                      run(async () => {
                        const r = await api("/api/staging/proofs", {
                          method: "POST",
                          body: form,
                        });
                        await refresh(detail.order.id);
                        setNotice(r.message);
                      });
                    }}
                  >
                    <h3>Upload fictional payment proof</h3>
                    <label>
                      PNG or JPEG · up to 5 MB
                      <input
                        name="file"
                        type="file"
                        accept="image/png,image/jpeg"
                        required
                      />
                    </label>
                    <label>
                      Sample amount (centavos)
                      <input
                        name="amount"
                        type="number"
                        min="1"
                        max={detail.order.total_centavos || 0}
                        required
                      />
                    </label>
                    <button className="button" disabled={busy}>
                      Submit proof for review
                    </button>
                  </form>
                )}
              {role === "owner" &&
                detail.order.payment_method === "Cash" &&
                detail.order.fulfillment_state === "ready_for_pickup" &&
                detail.order.payment_state !== "verified" && (
                  <button
                    className="button"
                    disabled={busy}
                    onClick={() => change("record_cash")}
                  >
                    Record simulated cash receipt
                  </button>
                )}
              <h3>Payment review</h3>
              {!detail.payments.length && <p>No payment records.</p>}
              {detail.payments.map((p) => (
                <div className="notice" key={p.id}>
                  <p>
                    {money(p.amount_centavos)} · {p.state}
                  </p>
                  {p.payment_proof_files.map((f) => (
                    <button
                      className="text-link"
                      key={f.id}
                      onClick={() =>
                        run(async () => {
                          const r = await api(`/api/staging/proofs?id=${f.id}`);
                          setProofUrl(r.url);
                        })
                      }
                    >
                      Open private proof for 60 seconds
                    </button>
                  ))}
                  {role === "owner" && p.state === "submitted" && (
                    <button
                      className="button"
                      disabled={busy}
                      onClick={() =>
                        change("verify_payment", { paymentId: p.id })
                      }
                    >
                      Manually verify test payment
                    </button>
                  )}
                </div>
              ))}
              {proofUrl && (
                <p>
                  <a
                    className="text-link"
                    href={proofUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View private proof ↗
                  </a>
                </p>
              )}
              <button
                className="text-link"
                onClick={() =>
                  run(async () => {
                    const r = await api(
                      `/api/staging/orders/${detail.order.id}`,
                      {
                        method: "PATCH",
                        body: JSON.stringify({ action: "tracking_link" }),
                      },
                    );
                    setTracking(new URL(r.path, window.location.origin).href);
                    await refresh(detail.order.id);
                  })
                }
              >
                Generate / rotate private tracking link
              </button>
              {tracking && (
                <label>
                  Private test tracking link · valid 7 days
                  <input
                    value={tracking}
                    readOnly
                    onFocus={(e) => e.target.select()}
                  />
                  <small>
                    Anyone with this link can see minimal test status.
                    Generating another link revokes the previous one.
                  </small>
                </label>
              )}
              <h3>Status history</h3>
              <ul>
                {detail.events.map((e) => (
                  <li key={e.id}>
                    {new Date(e.created_at).toLocaleString("en-PH", {
                      timeZone: "Asia/Manila",
                    })}{" "}
                    · {e.new_state.request} / {e.new_state.payment} /{" "}
                    {e.new_state.fulfillment}
                  </li>
                ))}
              </ul>
            </article>
          )}
        </div>
      </div>
    </section>
  );
}
