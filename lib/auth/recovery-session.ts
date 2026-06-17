"use client";

import {
  exchangeRecoveryCode,
  verifyRecoveryOtp,
} from "@/lib/auth/actions";
import { parseRecoveryParams } from "@/lib/auth/recovery";
import { markRecoveryFlow } from "@/lib/auth/recovery-cookie";
import { createClientOptional } from "@/lib/supabase/client";

export type RecoverySessionResult =
  | { ok: true }
  | { ok: false; reason: "invalid" | "unavailable" };

/**
 * Establish a Supabase recovery session from URL tokens (hash, PKCE code, or OTP).
 */
export async function establishRecoverySession(
  search = "",
  hash = "",
): Promise<RecoverySessionResult> {
  const params = parseRecoveryParams(search, hash);

  const hasTokens =
    Boolean(params.code) ||
    Boolean(params.tokenHash) ||
    Boolean(params.accessToken && params.refreshToken);

  if (!hasTokens) {
    const session = await fetch("/api/auth/session", {
      cache: "no-store",
      credentials: "same-origin",
    });
    if (session.ok) {
      markRecoveryFlow();
      return { ok: true };
    }
    return { ok: false, reason: "invalid" };
  }

  const supabase = createClientOptional();
  if (!supabase) {
    return { ok: false, reason: "unavailable" };
  }

  if (params.accessToken && params.refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: params.accessToken,
      refresh_token: params.refreshToken,
    });

    if (error) {
      console.error("[recovery:setSession]", error.message);
      return { ok: false, reason: "invalid" };
    }

    markRecoveryFlow();
    return { ok: true };
  }

  if (params.tokenHash) {
    const result = await verifyRecoveryOtp(params.tokenHash);
    if (!result.ok) {
      return { ok: false, reason: "invalid" };
    }
    markRecoveryFlow();
    return { ok: true };
  }

  if (params.code) {
    const { error: clientError } =
      await supabase.auth.exchangeCodeForSession(params.code);

    if (!clientError) {
      markRecoveryFlow();
      return { ok: true };
    }

    const result = await exchangeRecoveryCode(params.code);
    if (!result.ok) {
      console.error("[recovery:code-exchange]", result);
      return { ok: false, reason: "invalid" };
    }

    markRecoveryFlow();
    return { ok: true };
  }

  return { ok: false, reason: "invalid" };
}

export function stripRecoveryParamsFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("next");
  window.history.replaceState(null, "", url.pathname + url.search);
}

export function getRecoveryDestination(): string {
  return "/reset-password";
}
