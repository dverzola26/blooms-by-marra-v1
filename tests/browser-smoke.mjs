import { chromium } from "@playwright/test";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const errors = [];
page.setDefaultTimeout(10000);
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";
await page.goto(base, { waitUntil: "networkidle" });
await page.locator(".reference-hero img").first().waitFor();
await page.screenshot({
  path: "artifacts/smoke-home-desktop.png",
  fullPage: true,
});
assert.equal(await page.locator("h1").count(), 1);
assert.equal(
  await page.locator(".reference-occasions .occasion-tile").count(),
  6,
);
assert.equal(
  await page.locator(".reference-products .product-card:visible").count(),
  5,
);
const favorite = page.locator(".reference-products .save-flower").first();
await favorite.click();
assert.equal(await favorite.getAttribute("aria-pressed"), "true");
await favorite.click();
assert.equal(await favorite.getAttribute("aria-pressed"), "false");
assert.equal(
  await page
    .locator(".reference-products .product-image img")
    .evaluateAll(
      (imgs) => new Set(imgs.map((i) => i.getAttribute("src"))).size,
    ),
  5,
);

await page.goto(base + "/shop", { waitUntil: "networkidle" });
console.log("catalog loaded");
await page.getByLabel("Search", { exact: true }).fill("unfindable");
await page.getByText("No blooms found just yet.").waitFor();
await page.getByRole("button", { name: "Clear filters" }).click();
assert.equal(await page.locator(".product-card").count(), 5);
await page
  .getByRole("combobox", { name: /^Occasion/ })
  .selectOption("Birthday");
assert.equal(await page.locator(".product-card").count(), 1);
await page.getByRole("button", { name: "Add to demo cart" }).click();
console.log("cart added");
await page.goto(base + "/cart", { waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Blush garden study" }).waitFor();
await page.reload({ waitUntil: "networkidle" });
await page.getByRole("heading", { name: "Blush garden study" }).waitFor();
await page.getByRole("link", { name: "Rehearse checkout" }).click();
await page.getByRole("button", { name: "Validate demo request" }).click();
await page.getByRole("alert").first().waitFor();
await page.getByLabel("Your name", { exact: true }).fill("Demo Sender");
await page.getByLabel("Email", { exact: true }).fill("sender@example.com");
await page.getByLabel("Mobile number", { exact: true }).fill("09123456789");
await page.getByLabel("Recipient name", { exact: true }).fill("Demo Recipient");
await page
  .getByLabel("Recipient mobile number", { exact: true })
  .fill("09123456789");
await page
  .getByLabel("Complete recipient address")
  .fill("123 Fictional Street, Demo Barangay");
await page.getByLabel("Preferred date").fill("2027-01-15");
await page.locator("[name=consent]").check();
await page.getByRole("button", { name: "Store pickup", exact: true }).click();
await page.getByLabel("Preferred method").selectOption("Cash");
assert.ok(await page.getByText("Pickup", { exact: true }).count());
await page.getByRole("button", { name: "Validate demo request" }).click();
await page.getByRole("heading", { name: "Rehearsal complete" }).waitFor();
assert.ok(await page.getByText(/No order was saved/).count());
assert.equal((await page.request.get(base + "/api/admin")).status(), 401);
assert.equal((await page.request.post(base + "/api/orders")).status(), 503);
await page.goto(base + "/admin", { waitUntil: "networkidle" });
await page.getByRole("tab", { name: "Settings" }).click();
await page.getByLabel("Provisional delivery cutoff").fill("15:00");
await page.getByRole("button", { name: "Preview setting" }).click();
await page
  .getByText(
    "Preview updated for this panel only. No production setting was saved.",
  )
  .waitFor();
await page.setViewportSize({ width: 375, height: 812 });
await page.goto(base, { waitUntil: "networkidle" });
await page.screenshot({
  path: "artifacts/smoke-home-mobile.png",
  fullPage: true,
});
assert.equal(
  await page.locator(".reference-products .product-card:visible").count(),
  2,
);
await page.locator(".occasion-tile").last().scrollIntoViewIfNeeded();
assert.ok(
  await page.locator(".reference-occasions").evaluate((e) => e.scrollLeft > 0),
);

assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
);
await page.getByRole("button", { name: "Toggle menu" }).click();
await page
  .getByRole("navigation")
  .getByRole("link", { name: "Shop flowers", exact: true })
  .click();
await page.getByRole("heading", { name: "The flower collection" }).waitFor();
assert.ok(
  await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth,
  ),
);
for (const path of [
  "/shop/blush-study",
  "/cart",
  "/checkout",
  "/delivery",
  "/about",
  "/contact",
  "/faq",
  "/policies",
  "/status",
  "/admin",
]) {
  await page.goto(base + path, { waitUntil: "networkidle" });
  assert.equal(await page.locator("h1").count(), 1, path);
  assert.ok(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
    path + " overflow",
  );
}
assert.deepEqual(errors, []);
await browser.close();
console.log(
  "PASS: desktop/mobile navigation, catalog search/filter/empty state, favorite toggles, six occasions with mobile swipe, five desktop/two mobile product cards, distinct product images, cart persistence, invalid checkout recovery, pickup/cash rehearsal, API guards, admin settings preview, 10 route overflow checks, no browser runtime errors.",
);
