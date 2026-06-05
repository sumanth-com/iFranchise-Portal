import { createBrowserClient } from "@supabase/ssr";

import { assertSupabaseEnv, getSupabaseEnv } from "./env";
import { fetchWithTimeout } from "./fetch";

export function createClient() {
  const { url, publishableKey } = assertSupabaseEnv();

  return createBrowserClient(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
  });
}

/** Returns null when env is missing — never throws. Use in client UI fallbacks. */
export function createClientOptional() {
  const { url, publishableKey } = getSupabaseEnv();
  if (!url || !publishableKey) {
    return null;
  }

  return createBrowserClient(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
  });
}
