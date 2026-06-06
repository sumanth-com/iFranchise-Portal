import { createBrowserClient } from "@supabase/ssr";

import { assertSupabaseEnv } from "@/lib/supabase/env";

/**
 * Browser Supabase client for large file uploads — no short request timeout.
 * Use only for storage uploads, not general data fetching.
 */
export function createUploadClient() {
  const { url, publishableKey } = assertSupabaseEnv();
  return createBrowserClient(url, publishableKey);
}
