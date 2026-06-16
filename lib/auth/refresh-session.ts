import type { SupabaseClient } from "@supabase/supabase-js";

import {
  isInvalidSessionError,
  isServiceUnavailableError,
} from "@/lib/auth/resolve-auth";

/**
 * Attempt to refresh an expired session using the refresh token in cookies.
 * Edge-safe — no server-only imports. Use from middleware and API routes.
 */
export async function tryRefreshSession(
  supabase: SupabaseClient,
): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
      return true;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (user && (!userError || !isInvalidSessionError(userError))) {
      return true;
    }
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      throw error;
    }
  }

  return false;
}
