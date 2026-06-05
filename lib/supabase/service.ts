import { createClient as createSupabaseClient } from "@supabase/supabase-js";

import { assertSupabaseEnv } from "@/lib/supabase/env";

export function getServiceRoleKey(): string | undefined {
  return process.env.SUPABASE_SERVICE_ROLE_KEY;
}

export function createServiceClient() {
  const { url } = assertSupabaseEnv();
  const serviceRoleKey = getServiceRoleKey();

  if (!serviceRoleKey) {
    return null;
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
