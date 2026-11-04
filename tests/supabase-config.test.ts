import { test } from "node:test";
import assert from "node:assert/strict";
import { stagingConfig, HttpError } from "../src/lib/server/access";
const names = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "BLOOMS_STAGING_ENABLED",
] as const;
test("staging configuration supports the publishable name and legacy fallback without enabling live commerce", () => {
  const saved = Object.fromEntries(names.map((n) => [n, process.env[n]]));
  try {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://staging.example";
    process.env.BLOOMS_STAGING_ENABLED = "true";
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    assert.equal(stagingConfig().key, "test-publishable");
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-legacy";
    assert.equal(stagingConfig().key, "test-publishable");
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    assert.equal(stagingConfig().key, "test-legacy");
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    assert.throws(
      () => stagingConfig(),
      (e: unknown) => e instanceof HttpError && e.status === 503,
    );
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "test-publishable";
    process.env.BLOOMS_STAGING_ENABLED = "false";
    assert.throws(
      () => stagingConfig(),
      (e: unknown) => e instanceof HttpError && e.status === 503,
    );
  } finally {
    for (const n of names) {
      if (saved[n] === undefined) delete process.env[n];
      else process.env[n] = saved[n];
    }
  }
});
