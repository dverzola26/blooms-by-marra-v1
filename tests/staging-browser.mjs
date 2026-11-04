import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 375, height: 812 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = "http://127.0.0.1:3000";
await page.goto(base + "/admin/workspace", { waitUntil: "networkidle" });
assert.ok(page.url().endsWith("/admin/login"));
await page.getByRole("heading", { name: "Welcome back." }).waitFor();
assert.equal(
  await page.getByLabel("Password", { exact: true }).getAttribute("type"),
  "password",
);
assert.ok(
  await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await page.screenshot({
  path: "artifacts/staff-login-mobile.png",
  fullPage: true,
});
for (const path of ["/api/admin", "/api/staging/orders"])
  assert.equal((await page.request.get(base + path)).status(), 401, path);
for (const path of [
  "/api/auth/login",
  "/api/auth/logout",
  "/api/staging/orders",
  "/api/staging/operations",
  "/api/staging/proofs",
  "/api/tracking",
])
  assert.equal(
    (
      await page.request.post(base + path, {
        headers: { Origin: "https://foreign.example" },
        data: {},
      })
    ).status(),
    403,
    path,
  );
assert.equal(
  (
    await page.request.post(base + "/api/staging/orders", {
      headers: { Origin: base },
      data: {},
    })
  ).status(),
  401,
);
assert.equal(
  (await page.request.post(base + "/api/orders", { data: {} })).status(),
  503,
);
assert.equal(
  (
    await page.request.post(base + "/api/tracking", {
      headers: { Origin: base },
      data: { orderId: "invalid", token: "short" },
    })
  ).status(),
  404,
);
// Browser-only fixture tests the private fragment reader, not a hosted database or Auth service.
let trackingBody;
await page.route("**/api/tracking", async (route) => {
  trackingBody = route.request().postDataJSON();
  await route.fulfill({
    json: {
      status: {
        reference: "50000000-0000-4000-8000-000000000001",
        request: "awaiting_payment",
        payment: "submitted",
        fulfillment: "unconfirmed",
        mode: "pickup",
        date: "2027-01-15",
      },
    },
  });
});
await page.goto(
  base +
    "/status#id=50000000-0000-4000-8000-000000000001&token=" +
    "a".repeat(64),
  { waitUntil: "networkidle" },
);
await page.getByRole("heading", { name: "Staging request 50000000" }).waitFor();
assert.equal(new URL(page.url()).hash, "");
assert.equal(trackingBody.token.length, 64);
await page.getByText("Proof awaiting review", { exact: true }).waitFor();
await page.screenshot({
  path: "artifacts/staging-tracking-mobile.png",
  fullPage: true,
});
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: protected page redirect, login fields/mobile layout, logged-out API guards, CSRF rejection, live order gate, invalid tracking token, fragment-only tracking reader (fixture response), no runtime errors.",
);
