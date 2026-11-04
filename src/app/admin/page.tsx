"use client";
import Link from "next/link";
import { useState } from "react";
import { products, money, settings } from "@/lib/commerce";
export default function Admin() {
  const [tab, setTab] = useState("Overview");
  const [cutoff, setCutoff] = useState(settings.cutoff);
  const [notice, setNotice] = useState("");
  return (
    <section className="section">
      <p className="eyebrow">OWNER WORKSPACE · PUBLIC DEMO PREVIEW</p>
      <h1>A little behind the blooms.</h1>
      <p className="notice">
        This is a public interface preview with sample data only. No customer
        records, real sales or privileged operations are exposed. Production
        access requires Supabase authentication and server-side roles.
      </p>
      <p>
        <Link className="button" href="/admin/login">
          Staff sign-in · staging
        </Link>
      </p>
      <div className="admin-tabs" role="tablist">
        {["Overview", "Catalog", "Orders", "Settings"].map((t) => (
          <button
            role="tab"
            aria-selected={tab === t}
            key={t}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div className="admin-panel" role="tabpanel">
        {tab === "Overview" && (
          <>
            <h2>Your shop, at a glance</h2>
            <div className="stat-grid">
              {[
                ["Catalog", "5 demo concepts"],
                ["Orders", "Not connected"],
                ["Payments", "Disabled"],
              ].map(([h, v]) => (
                <article key={h}>
                  <p>{h}</p>
                  <h3>{v}</h3>
                </article>
              ))}
            </div>
            <h3>Before opening your doors online</h3>
            <ul>
              <li>Import the approved catalog and authentic photography.</li>
              <li>Confirm branch coverage, delivery fees and cutoff.</li>
              <li>Apply and test Supabase migrations and staff access.</li>
              <li>Approve privacy, payment and store policies.</li>
            </ul>
          </>
        )}
        {tab === "Catalog" && (
          <>
            <h2>Catalog preview</h2>
            <p>
              Sample records only. Production editing and publishing are
              disabled.
            </p>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Arrangement</th>
                    <th>Branch</th>
                    <th>Sample price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td>{p.name}</td>
                      <td>{p.branch}</td>
                      <td>{p.custom ? "Quote" : money(p.price)}</td>
                      <td>Demo · unpublished</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === "Orders" && (
          <>
            <h2>The fulfillment queue</h2>
            <div className="empty">
              <h3>No connected order data</h3>
              <p>
                New requests will require staff review. Proof submitted →
                payment review → explicit verification. Fulfillment approval is
                a separate decision.
              </p>
            </div>
            <p>
              Staff are restricted to their assigned branch. Owner-only
              configuration and payment audit fields are protected in the
              migration.
            </p>
          </>
        )}
        {tab === "Settings" && (
          <>
            <h2>Fulfillment settings preview</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setNotice(
                  "Preview updated for this panel only. No production setting was saved.",
                );
              }}
            >
              <label>
                Provisional delivery cutoff · Asia/Manila
                <input
                  type="time"
                  value={cutoff}
                  onChange={(e) => setCutoff(e.target.value)}
                  required
                />
              </label>
              <p>
                This unconfirmed internal default is not advertised publicly.
                Pickup follows separate rules. Per-branch and holiday settings
                are modeled in the database.
              </p>
              <button className="button">Preview setting</button>
              <p role="status">{notice}</p>
            </form>
          </>
        )}
      </div>
    </section>
  );
}
