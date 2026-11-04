import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseConfig } from "./config";
import { supabaseFetch } from "./fetch";
import { isSessionCookie, sessionCookieOptions } from "./session";
// A test transport can exercise actual SDK refresh/cookie behavior without a hosted project.
export async function updateSession(
  request: NextRequest,
  transport: typeof fetch = supabaseFetch,
) {
  const writes = new Map<
    string,
    { name: string; value: string; options: CookieOptions }
  >();
  const headers = new Headers({
    "Cache-Control": "private, no-store",
    "Referrer-Policy": "no-referrer",
  });
  function nextResponse() {
    const result = NextResponse.next({ request });
    for (const cookie of writes.values())
      result.cookies.set(cookie.name, cookie.value, cookie.options);
    headers.forEach((v, k) => result.headers.set(k, v));
    return result;
  }
  let response = nextResponse();
  if (
    process.env.BLOOMS_STAGING_ENABLED !== "true" ||
    !request.cookies.getAll().some((c) => isSessionCookie(c.name))
  )
    return response;
  let config;
  try {
    config = getSupabaseConfig();
  } catch {
    return response;
  }
  const supabase = createServerClient(config.url, config.key, {
    global: { fetch: transport },
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, cacheHeaders) {
        for (const cookie of cookiesToSet) {
          request.cookies.set(cookie.name, cookie.value);
          writes.set(cookie.name, cookie);
        }
        for (const [key, value] of Object.entries(cacheHeaders))
          headers.set(key, value);
        response = nextResponse();
      },
    },
  });
  // This call loads the session, refreshes expired tokens and verifies the user.
  // Cookie presence or getSession() alone must never authorize a staff request.
  try {
    await supabase.auth.getUser();
  } catch {
    // Keep a session on transient transport failures. Protected routes fail closed
    // using their own getUser() + role checks; the public storefront stays available.
  }
  return response;
}
