import { getSupabaseConfig } from "../../utils/supabase/config";
import { supabaseFetch } from "../../utils/supabase/fetch";
import { createClient as createServerClient } from "../../utils/supabase/server";
import { isSessionCookie } from "../../utils/supabase/session";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { checkOrigin } from "../staging";
export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export function stagingConfig() {
  if (process.env.BLOOMS_STAGING_ENABLED !== "true")
    throw new HttpError(
      503,
      "Staging is not configured. No operation was performed.",
    );
  try {
    return getSupabaseConfig();
  } catch {
    throw new HttpError(
      503,
      "Staging requires a configured HTTPS Supabase URL and publishable key.",
    );
  }
}
export function client(token?: string) {
  const { url, key } = stagingConfig();
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: supabaseFetch,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
}
export async function staff() {
  const cookieStore = await cookies();
  if (!cookieStore.getAll().some((c) => isSessionCookie(c.name)))
    throw new HttpError(401, "Staff sign-in required.");
  stagingConfig();
  const db = createServerClient(cookieStore);
  const {
    data: { user },
    error,
  } = await db.auth.getUser();
  if (error || !user)
    throw new HttpError(401, "Your session expired. Sign in again.");
  const { data: profile, error: profileError } = await db
    .from("profiles")
    .select("role,branch_id")
    .eq("id", user.id)
    .single();
  if (
    profileError ||
    !profile ||
    !["owner", "staff"].includes(profile.role) ||
    (profile.role === "staff" && !profile.branch_id)
  )
    throw new HttpError(403, "This account has no assigned staff role.");
  return {
    db,
    user,
    profile: profile as { role: "owner" | "staff"; branch_id: string | null },
  };
}
export function sameOrigin(request: Request) {
  if (!checkOrigin(request))
    throw new HttpError(403, "Same-origin request required.");
}
export function privateJson(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store, private",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
export function failure(e: unknown) {
  if (e instanceof HttpError)
    return privateJson({ error: e.message }, e.status);
  return privateJson(
    { error: "The operation could not be completed. Please retry." },
    500,
  );
}
export function databaseError(
  error: { message: string; code?: string } | null,
) {
  if (!error) return;
  const allowed = [
    "Staging only",
    "Forbidden",
    "Stale order",
    "Invalid transition",
    "Payment required",
    "Invalid order",
    "Invalid amount",
    "Quote required",
    "Unavailable destination",
    "Invalid item",
    "Date unavailable",
    "Not found",
    "Duplicate request mismatch",
    "Payment instructions unavailable",
  ];
  const message = allowed.find((m) => error.message.includes(m));
  throw new HttpError(
    message === "Forbidden" ? 403 : 409,
    message ||
      "Database operation rejected. Check staging migrations and retry.",
  );
}
// Bounded per-process backstop. Supabase Auth limits also apply; distributed edge limiting is required before public launch.
const attempts = new Map<string, { count: number; until: number }>();
export function limit(request: Request, scope: string, max = 20) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "shared";
  const key = `${scope}:${ip}`;
  const now = Date.now();
  if (attempts.size > 2000) {
    for (const [k, v] of attempts) if (v.until < now) attempts.delete(k);
    if (attempts.size > 2000)
      throw new HttpError(429, "Please wait before retrying.");
  }
  const old = attempts.get(key);
  if (!old || old.until < now) {
    attempts.set(key, { count: 1, until: now + 60000 });
    return;
  }
  if (++old.count > max)
    throw new HttpError(429, "Please wait before retrying.");
}
export async function boundedBytes(request: Request, max: number) {
  const reader = request.body?.getReader();
  if (!reader) return new Uint8Array();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > max) {
        await reader.cancel();
        throw new HttpError(413, "Request is too large.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks);
}
export async function jsonBody(request: Request, max = 30000) {
  const text = new TextDecoder().decode(await boundedBytes(request, max));
  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
}
