import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { assertSupabaseEnv } from "@/lib/supabase/env";
import { fetchWithTimeoutServer } from "@/lib/supabase/fetch-server";

/**
 * Supabase client scoped to one user JWT so auth.uid() is set for RLS policies.
 * Use for INSERT/UPDATE/DELETE on brands and brand_assets from server actions.
 */
export function createClientWithAccessToken(accessToken: string) {
  const { url, publishableKey } = assertSupabaseEnv();

  return createSupabaseClient(url, publishableKey, {
    global: {
      fetch: fetchWithTimeoutServer,
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
