"use client";

import { exchangeRecoveryCode, verifyRecoveryOtp } from "@/lib/auth/actions";
import {
  classifyRecoveryError,
  parseRecoveryParams,
  type RecoveryErrorReason,
} from "@/lib/auth/recovery";
import { markRecoveryFlow } from "@/lib/auth/recovery-cookie";
import { createClientOptional } from "@/lib/supabase/client";

export type RecoverySessionResult =
  | { ok: true }
  | { ok: false; reason: RecoveryErrorReason };

/**
 * Establish a Supabase recovery session from URL tokens (hash, PKCE code, or OTP).
 * Each token is exchanged exactly once to avoid rate-limit errors.
 */
export async function establishRecoverySession(
  search = "",
  hash = "",
  pathname = "",
): Promise<RecoverySessionResult> {
  const params = parseRecoveryParams(search, hash, pathname);

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
    return { ok: false, reason: "missing" };
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
      return {
        ok: false,
        reason: classifyRecoveryError(error.code, error.message),
      };
    }

    markRecoveryFlow();
    return { ok: true };
  }

  if (params.tokenHash) {
    const result = await verifyRecoveryOtp(params.tokenHash);
    if (!result.ok) {
      return {
        ok: false,
        reason: classifyRecoveryError(result.code, result.message),
      };
    }
    markRecoveryFlow();
    return { ok: true };
  }

  if (params.code) {
    // Single server-side exchange — PKCE verifier lives in auth cookies.
    const result = await exchangeRecoveryCode(params.code);
    if (!result.ok) {
      console.error("[recovery:code-exchange]", result);
      return {
        ok: false,
        reason: classifyRecoveryError(result.code, result.message),
      };
    }

    markRecoveryFlow();
    return { ok: true };
  }

  return { ok: false, reason: "missing" };
}

export function stripRecoveryParamsFromUrl(): void {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.hash = "";
  url.searchParams.delete("code");
  url.searchParams.delete("token_hash");
  url.searchParams.delete("type");
  url.searchParams.delete("next");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  url.searchParams.delete("recovery_error");
  window.history.replaceState(null, "", url.pathname + url.search);
}

export function getRecoveryDestination(): string {
  return "/reset-password";
}
