import { test } from "node:test";
import assert from "node:assert/strict";
import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "../src/utils/supabase/middleware";
import { createClient } from "../src/utils/supabase/server";
import {
  sessionCookieName,
  isSessionCookie,
} from "../src/utils/supabase/session";
const envNames = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "BLOOMS_STAGING_ENABLED",
] as const;
const user = {
  id: "40000000-0000-4000-8000-000000000001",
  aud: "authenticated",
  email: "staff@example.invalid",
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-01-01T00:00:00Z",
};
function jwt(expires: number) {
  return [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: user.id,
        aud: "authenticated",
        role: "authenticated",
        exp: expires,
        iat: expires - 3600,
      }),
    ).toString("base64url"),
    "fixture-signature",
  ].join(".");
}
function session(expires: number) {
  return {
    access_token: jwt(expires),
    refresh_token: "fixture-refresh",
    expires_at: expires,
    expires_in: 3600,
    token_type: "bearer",
    user,
  };
}
function encode(value: unknown) {
  return "base64-" + Buffer.from(JSON.stringify(value)).toString("base64url");
}
function request(value?: unknown) {
  return new NextRequest("https://shop.example/admin/workspace", {
    headers: value ? { cookie: `${sessionCookieName}=${encode(value)}` } : {},
  });
}
test("Supabase SSR refresh and cookie persistence with the real SDK and a fixture Auth transport", async (t) => {
  const saved = Object.fromEntries(envNames.map((n) => [n, process.env[n]]));
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.example";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "fixture-publishable";
  process.env.BLOOMS_STAGING_ENABLED = "true";
  try {
    await t.test(
      "signed-out requests avoid Auth calls and are never publicly cached",
      async () => {
        let called = false;
        const response = await updateSession(request(), async () => {
          called = true;
          throw Error("unexpected");
        });
        assert.equal(called, false);
        assert.match(response.headers.get("cache-control") || "", /no-store/);
        assert.equal(response.cookies.getAll().length, 0);
      },
    );
    await t.test(
      "expired sessions refresh before rendering; chunked cookies reach request and response",
      async () => {
        const calls: string[] = [];
        const now = Math.floor(Date.now() / 1000);
        const rotated = {
          ...session(now + 3600),
          refresh_token: "fixture-rotated",
          user: { ...user, user_metadata: { fixture: "x".repeat(7000) } },
        };
        const req = request(session(now - 120));
        const response = await updateSession(req, async (input) => {
          const url = String(input);
          calls.push(url);
          if (url.includes("/token?grant_type=refresh_token"))
            return Response.json(rotated);
          if (url.endsWith("/user")) return Response.json(rotated.user);
          throw Error("Unexpected fixture request");
        });
        assert.ok(
          calls.some((s) => s.includes("/token?grant_type=refresh_token")),
        );
        assert.ok(calls.some((s) => s.endsWith("/user")));
        const chunks = response.cookies
          .getAll()
          .filter((c) => isSessionCookie(c.name) && c.value);
        assert.ok(chunks.length > 1);
        for (const c of chunks) {
          assert.equal(req.cookies.get(c.name)?.value, c.value);
          assert.equal(c.sameSite, "strict");
          assert.equal(c.path, "/");
        }
        assert.equal(response.cookies.get(sessionCookieName)?.maxAge, 0);
        assert.match(response.headers.get("cache-control") || "", /no-store/);
        assert.equal(response.headers.get("pragma"), "no-cache");
        assert.equal(response.headers.get("expires"), "0");
        assert.ok(
          response.headers
            .get("x-middleware-override-headers")
            ?.includes("cookie"),
        );
      },
    );
    await t.test("staging-off requests never refresh a session", async () => {
      process.env.BLOOMS_STAGING_ENABLED = "false";
      let called = false;
      await updateSession(request(session(0)), async () => {
        called = true;
        throw Error("unexpected");
      });
      assert.equal(called, false);
      process.env.BLOOMS_STAGING_ENABLED = "true";
    });
    await t.test(
      "server helper stores SSR access/refresh cookies and sign-out removes every chunk",
      async () => {
        const jar = new NextResponse().cookies;
        const now = Math.floor(Date.now() / 1000);
        const auth = createClient(
          jar as unknown as Parameters<typeof createClient>[0],
          {
            writable: true,
            transport: async (input) => {
              const url = String(input);
              if (url.includes("/token?grant_type=password"))
                return Response.json(session(now + 3600));
              if (url.includes("/logout"))
                return new Response(null, { status: 204 });
              throw Error("Unexpected fixture request");
            },
          },
        );
        const { error } = await auth.auth.signInWithPassword({
          email: user.email,
          password: "fixture-password",
        });
        assert.equal(error, null);
        assert.ok(jar.getAll().some((c) => isSessionCookie(c.name) && c.value));
        await auth.auth.signOut({ scope: "local" });
        assert.ok(
          jar
            .getAll()
            .filter((c) => isSessionCookie(c.name))
            .every((c) => !c.value && c.maxAge === 0),
        );
      },
    );
    await t.test(
      "route-handler cookie persistence failures are not silently ignored",
      async (t) => {
        t.mock.method(console, "error", () => {});
        const jar = {
          getAll: () => [],
          set: () => {
            throw Error("fixture-cookie-write-failed");
          },
          delete: () => {},
        };
        const auth = createClient(
          jar as unknown as Parameters<typeof createClient>[0],
          {
            writable: true,
            transport: async () =>
              Response.json(session(Math.floor(Date.now() / 1000) + 3600)),
          },
        );
        let failed = false;
        try {
          const { error } = await auth.auth.signInWithPassword({
            email: user.email,
            password: "fixture-password",
          });
          failed = !!error;
        } catch {
          failed = true;
        }
        assert.ok(failed);
      },
    );
  } finally {
    for (const name of envNames) {
      if (saved[name] === undefined) delete process.env[name];
      else process.env[name] = saved[name];
    }
  }
});
