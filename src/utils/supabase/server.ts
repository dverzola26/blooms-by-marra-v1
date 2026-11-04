import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";
import { supabaseFetch } from "./fetch";
import { isAuthCookie, sessionCookieOptions } from "./session";
type CookieStore = Awaited<ReturnType<typeof cookies>>;
export function clearAuthCookies(cookieStore: CookieStore) {
  for (const c of cookieStore.getAll())
    if (isAuthCookie(c.name)) cookieStore.delete(c.name);
}
export function createClient(
  cookieStore: CookieStore,
  options: { writable?: boolean; transport?: typeof fetch } = {},
) {
  const { url, key } = getSupabaseConfig();
  return createServerClient(url, key, {
    global: { fetch: options.transport || supabaseFetch },
    cookieOptions: sessionCookieOptions,
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet)
            cookieStore.set(name, value, options);
        } catch (error) {
          // Server Components cannot mutate cookies. proxy.ts refreshes before rendering.
          // Route handlers opt into strict writes so failed persistence never looks successful.
          if (options.writable) throw error;
        }
      },
    },
  });
}
