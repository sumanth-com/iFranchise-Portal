"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  establishRecoverySession,
  stripRecoveryParamsFromUrl,
} from "@/lib/auth/recovery-session";
import { isRecoveryNext, RECOVERY_CALLBACK_NEXT } from "@/lib/auth/recovery";
import { markRecoveryFlow } from "@/lib/auth/recovery-cookie";

/**
 * Handles Supabase redirects that deliver session tokens in the URL hash
 * (#access_token=...) — invisible to server route handlers.
 * Also supports ?code= PKCE and ?token_hash= recovery OTP.
 */
export function AuthCallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const next = searchParams.get("next");
      const isRecovery = isRecoveryNext(next);

      if (isRecovery) {
        const result = await establishRecoverySession(
          window.location.search,
          window.location.hash,
        );

        if (cancelled) return;

        stripRecoveryParamsFromUrl();

        if (!result.ok) {
          console.error("[auth-callback:recovery]", result);
          window.location.replace("/forgot-password");
          return;
        }

        markRecoveryFlow();
        window.location.replace(RECOVERY_CALLBACK_NEXT);
        return;
      }

      const code = searchParams.get("code");
      if (code) {
        const { exchangeCallbackCode } = await import("@/lib/auth/actions");
        const result = await exchangeCallbackCode(code, next);

        if (cancelled) return;

        if (!result.ok) {
          console.error("[auth-callback:code-exchange]", { error: result.error });
          window.location.replace("/forgot-password");
          return;
        }

        window.location.replace(result.redirectTo);
        return;
      }

      console.error("[auth-callback:no-tokens]", {
        search: window.location.search,
        hash: Boolean(window.location.hash),
      });
      window.location.replace("/forgot-password");
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return <AuthLoadingScreen message="Preparing password reset…" />;
}
