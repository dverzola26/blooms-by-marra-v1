import { cookies } from "next/headers";
import { createClient, clearAuthCookies } from "@/utils/supabase/server";
import { isSessionCookie } from "@/utils/supabase/session";
import {
  sameOrigin,
  privateJson,
  failure,
  stagingConfig,
} from "@/lib/server/access";
export async function POST(request: Request) {
  try {
    sameOrigin(request);
    const store = await cookies();
    try {
      if (store.getAll().some((c) => isSessionCookie(c.name))) {
        stagingConfig();
        await createClient(store, { writable: true }).auth.signOut({
          scope: "local",
        });
      }
    } catch {
      // Local sign-out must still work if the remote provider is unavailable.
    } finally {
      clearAuthCookies(store);
    }
    return privateJson({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
