"use client";
import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";
import { sessionCookieOptions } from "./session";
export function createClient() {
  const { url, key } = getSupabaseConfig();
  return createBrowserClient(url, key, { cookieOptions: sessionCookieOptions });
}
