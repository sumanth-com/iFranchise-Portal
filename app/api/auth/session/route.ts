import { NextResponse } from "next/server";

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

    const resolved = resolveUserFromGetUser(user, error);

    if (resolved.unavailable) {
      return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
    }

    if (!resolved.user) {
      const reason = error && isInvalidSessionError(error) ? "expired" : "auth";
      return jsonWithNoStore({ ok: false, reason }, 401);
    }

    return jsonWithNoStore({ ok: true, userId: resolved.user.id }, 200);
  } catch {
    return jsonWithNoStore({ ok: false, reason: "unavailable" }, 503);
  }
}
