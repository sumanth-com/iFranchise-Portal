import { NextResponse } from "next/server";

import { tryRefreshSession } from "@/lib/auth/refresh-session";
import { applyNoStoreHeaders } from "@/lib/auth/cookies";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import { createClientOptional } from "@/lib/supabase/server";

function jsonWithNoStore(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  const response = NextResponse.json(body, { status });
  applyNoStoreHeaders(response);
  return response;
}

/**
 * Silently attempts to refresh the session from cookies.
 * Used by AuthSessionGuard before redirecting to login.
 */
export async function GET() {
  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
    }

    const refreshed = await tryRefreshSession(supabase);
    if (refreshed) {
      return jsonWithNoStore({ ok: true }, 200);
    }

    return jsonWithNoStore({ ok: false, reason: "expired" }, 401);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
    }
    return jsonWithNoStore({ ok: false, reason: "auth" }, 401);
  }
}

export async function POST() {
  return GET();
}
