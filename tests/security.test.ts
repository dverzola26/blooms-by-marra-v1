import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { sanitizeProof } from "../src/lib/server/proof";
import { checkOrigin, trackingSchema, actionSchema } from "../src/lib/staging";
test("mutations reject missing and foreign Origin", () => {
  assert.equal(
    checkOrigin(
      new Request("https://shop.example/api", {
        headers: { Origin: "https://evil.example" },
      }),
    ),
    false,
  );
  assert.equal(checkOrigin(new Request("https://shop.example/api")), false);
  assert.equal(
    checkOrigin(
      new Request("https://shop.example/api", {
        headers: { Origin: "https://shop.example" },
      }),
    ),
    true,
  );
});
test("tracking requires full UUID and 256-bit hex token", () => {
  assert.equal(
    trackingSchema.safeParse({ orderId: crypto.randomUUID(), token: "abc" })
      .success,
    false,
  );
  assert.ok(
    trackingSchema.safeParse({
      orderId: crypto.randomUUID(),
      token: "a".repeat(64),
    }).success,
  );
});
test("actions cannot inject arbitrary status or skip version checks", () => {
  assert.equal(
    actionSchema.safeParse({ action: "paid", version: 1 }).success,
    false,
  );
  assert.equal(
    actionSchema.safeParse({ action: "verify_payment", version: 1 }).success,
    false,
  );
  assert.equal(actionSchema.safeParse({ action: "confirm" }).success, false);
});
test("proof rejects false MIME, unsupported PDF, corrupt raster and oversized bytes", async () => {
  await assert.rejects(
    sanitizeProof(Buffer.from("%PDF-1.7"), "application/pdf"),
  );
  await assert.rejects(sanitizeProof(Buffer.from("hello"), "image/png"));
  await assert.rejects(
    sanitizeProof(Buffer.from([255, 216, 255, 0]), "image/jpeg"),
  );
  await assert.rejects(
    sanitizeProof(Buffer.alloc(5 * 1024 * 1024 + 1), "image/jpeg"),
  );
});
test("proof decodes real images, strips metadata and bounds size", async () => {
  const original = await sharp({
    create: { width: 2000, height: 20, channels: 3, background: "pink" },
  })
    .withMetadata()
    .png()
    .toBuffer();
  const clean = await sanitizeProof(original, "image/png");
  const metadata = await sharp(clean).metadata();
  assert.equal(metadata.format, "jpeg");
  assert.equal(metadata.width, 1600);
  assert.equal(metadata.exif, undefined);
  await assert.rejects(sanitizeProof(original, "image/jpeg"));
});

test("same-origin check supports the browser Host when Next uses an internal hostname", () => {
  assert.ok(
    checkOrigin(
      new Request("http://localhost:3000/api", {
        headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" },
      }),
    ),
  );
  assert.equal(
    checkOrigin(
      new Request("http://localhost:3000/api", {
        headers: { host: "127.0.0.1:3000", origin: "https://127.0.0.1:3000" },
      }),
    ),
    false,
  );
});
