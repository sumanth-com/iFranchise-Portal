import { NextResponse } from "next/server";

import { tryRefreshSession } from "@/lib/auth/refresh-session";
import { applyNoStoreHeaders } from "@/lib/auth/cookies";
import {
  isInvalidSessionError,
  resolveUserFromGetUser,
} from "@/lib/auth/resolve-auth";
import { createClientOptional } from "@/lib/supabase/server";

function jsonWithNoStore(
  body: Record<string, unknown>,
  status: number,
): NextResponse {
  const response = NextResponse.json(body, { status });
  applyNoStoreHeaders(response);
  return response;
}

export async function GET() {
  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    let resolved = resolveUserFromGetUser(user, error);

    if (!resolved.user && error && isInvalidSessionError(error)) {
      const refreshed = await tryRefreshSession(supabase);
      if (refreshed) {
        const {
          data: { user: refreshedUser },
          error: refreshError,
        } = await supabase.auth.getUser();
        resolved = resolveUserFromGetUser(refreshedUser, refreshError);
      }
    }

    if (resolved.unavailable) {
      return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
    }

    if (!resolved.user) {
      return jsonWithNoStore({ ok: false, reason: "expired" }, 401);
    }

    return jsonWithNoStore({ ok: true, userId: resolved.user.id }, 200);
  } catch {
    return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
  }
}
