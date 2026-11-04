import { createClient, clearAuthCookies } from "@/utils/supabase/server";
import { legacySessionCookie } from "@/utils/supabase/session";
import { z } from "zod";
import { cookies } from "next/headers";
import {
  stagingConfig,
  sameOrigin,
  privateJson,
  failure,
  HttpError,
  limit,
  jsonBody,
} from "@/lib/server/access";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    limit(request, "login", 8);
    const parsed = z
      .object({ email: z.email(), password: z.string().min(1).max(256) })
      .safeParse(await jsonBody(request, 2000));
    if (!parsed.success)
      throw new HttpError(400, "Enter a valid email and password.");
    stagingConfig();
    const cookieStore = await cookies();
    const db = createClient(cookieStore, { writable: true });
    const { data, error } = await db.auth.signInWithPassword(parsed.data);
    if (error && !error.status)
      throw new HttpError(
        503,
        "Staging authentication is unavailable. Check the project and network configuration.",
      );
    if (error || !data.session)
      throw new HttpError(401, "Sign-in failed. Check your credentials.");
    const { data: profile } = await db
      .from("profiles")
      .select("role,branch_id")
      .eq("id", data.user.id)
      .single();
    if (
      !profile ||
      !["owner", "staff"].includes(profile.role) ||
      (profile.role === "staff" && !profile.branch_id)
    ) {
      try {
        await db.auth.signOut({ scope: "local" });
      } finally {
        clearAuthCookies(cookieStore);
      }
      throw new HttpError(403, "This account has no assigned staff role.");
    }
    cookieStore.delete(legacySessionCookie);
    return privateJson({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
