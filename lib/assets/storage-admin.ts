import { createServiceClient } from "@/lib/supabase/service";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role client for server-side asset operations (storage + brand_assets rows).
 * Only call after session auth and brand ownership checks in server actions.
 */
export function getAssetsAdminClient(): SupabaseClient | null {
  return createServiceClient();
}

/** @deprecated Use getAssetsAdminClient */
export function getStorageAdminClient(): SupabaseClient | null {
  return getAssetsAdminClient();
}
