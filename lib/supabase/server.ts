import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { assertSupabaseEnv, getSupabaseEnv } from "./env";
import { fetchWithTimeout } from "./fetch";

async function buildServerClient(url: string, publishableKey: string) {
  const cookieStore = await cookies();

  return createServerClient(url, publishableKey, {
    global: { fetch: fetchWithTimeout },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll can run from a Server Component where cookies are read-only.
        }
      },
    },
  });
}

export async function createClient() {
  const { url, publishableKey } = assertSupabaseEnv();
  return buildServerClient(url, publishableKey);
}

/** Returns null when env is missing or invalid — never throws. */
export async function createClientOptional() {
  const { url, publishableKey } = getSupabaseEnv();
  if (!url || !publishableKey) {
    return null;
  }

  try {
    return await buildServerClient(url, publishableKey);
  } catch {
    return null;
  }
}
