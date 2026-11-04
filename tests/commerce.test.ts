import { test } from "node:test";
import assert from "node:assert/strict";
import {
  fulfillmentReview,
  priceCart,
  paymentTransition,
  depositDue,
  checkoutSchema,
} from "../src/lib/commerce";
for (const cutoff of ["14:00", "15:00"])
  for (const delta of [-1, 0, 1])
    test(`Manila ${cutoff} boundary ${delta}`, () => {
      const hour = Number(cutoff.slice(0, 2)) - 8;
      const now = new Date(Date.UTC(2026, 10, 4, hour, delta));
      assert.equal(
        fulfillmentReview("delivery", "2026-11-04", cutoff, now),
        delta < 0 ? "pending_confirmation" : "needs_review",
      );
      assert.equal(
        fulfillmentReview("pickup", "2026-11-04", cutoff, now),
        "pending_confirmation",
      );
    });
test("included Metro Manila delivery is not charged twice", () => {
  assert.equal(
    priceCart(
      [{ id: "blush-study", quantity: 2, message: "" }],
      "delivery",
      "valenzuela",
      "Valenzuela",
    ).fee,
    0,
  );
});
test("Pampanga uses its own rate", () =>
  assert.equal(
    priceCart(
      [{ id: "sunshine-study", quantity: 1, message: "" }],
      "delivery",
      "angeles",
      "Angeles",
    ).fee,
    18000,
  ));
test("standees use city-specific fees", () => {
  assert.equal(
    priceCart(
      [{ id: "ivory-study", quantity: 1, message: "" }],
      "delivery",
      "valenzuela",
      "Makati",
    ).fee,
    30000,
  );
});
test("pickup fee zero", () =>
  assert.equal(
    priceCart(
      [{ id: "ivory-study", quantity: 1, message: "" }],
      "pickup",
      "valenzuela",
      "",
    ).fee,
    0,
  ));
test("outside-area and cross-branch carts rejected", () => {
  assert.throws(() =>
    priceCart(
      [{ id: "blush-study", quantity: 1, message: "" }],
      "delivery",
      "valenzuela",
      "Cebu",
    ),
  );
  assert.throws(() =>
    priceCart(
      [{ id: "blush-study", quantity: 1, message: "" }],
      "pickup",
      "angeles",
      "",
    ),
  );
});
test("custom quote does not invent final total", () =>
  assert.equal(
    priceCart(
      [{ id: "custom-study", quantity: 1, message: "" }],
      "delivery",
      "angeles",
      "Angeles",
    ).total,
    null,
  ));
test("unavailable stock and custom need review; past date unavailable", () => {
  const now = new Date("2026-11-04T02:00:00Z");
  assert.equal(
    fulfillmentReview("delivery", "2026-11-04", "14:00", now, false),
    "needs_review",
  );
  assert.equal(
    fulfillmentReview("delivery", "2026-11-04", "14:00", now, true, true),
    "needs_review",
  );
  assert.equal(
    fulfillmentReview("pickup", "2026-11-03", "14:00", now),
    "unavailable",
  );
});
test("proof upload is not verification", () => {
  assert.equal(
    paymentTransition("unpaid", "submitted", "customer"),
    "submitted",
  );
  assert.throws(() => paymentTransition("submitted", "verified", "customer"));
  assert.equal(paymentTransition("submitted", "verified", "staff"), "verified");
});
test("full payment and owner-approved deposits", () => {
  assert.equal(depositDue(100000, 100, false), 100000);
  assert.throws(() => depositDue(100000, 50, false));
  assert.throws(() => depositDue(100000, 49, true));
  assert.equal(depositDue(100000, 50, true), 50000);
});
const form = {
  customer: "Test Sender",
  email: "sender@example.com",
  phone: "09123456789",
  recipient: "Test Recipient",
  recipientPhone: "09123456789",
  address: "123 Example Street",
  mode: "delivery",
  payment: "GCash",
  date: "2026-11-05",
  window: "Morning",
  consent: true,
};
test("delivery validation and cash restriction", () => {
  assert.ok(checkoutSchema.safeParse(form).success);
  assert.ok(!checkoutSchema.safeParse({ ...form, address: "x" }).success);
  assert.ok(!checkoutSchema.safeParse({ ...form, payment: "Cash" }).success);
  assert.ok(
    checkoutSchema.safeParse({
      ...form,
      mode: "pickup",
      payment: "Cash",
      address: "",
    }).success,
  );
});
test("cart input rejects invalid quantity and missing products", () => {
  for (const quantity of [-1, 0, 1.1, 21])
    assert.throws(() =>
      priceCart(
        [{ id: "blush-study", quantity, message: "" }],
        "pickup",
        "valenzuela",
        "",
      ),
    );
  assert.throws(() =>
    priceCart(
      [{ id: "missing", quantity: 1, message: "" }],
      "pickup",
      "valenzuela",
      "",
    ),
  );
});
test("invalid recipient phone and calendar date are rejected", () => {
  assert.ok(
    !checkoutSchema.safeParse({ ...form, recipientPhone: "invalid" }).success,
  );
  assert.ok(!checkoutSchema.safeParse({ ...form, date: "2026-02-30" }).success);
});
