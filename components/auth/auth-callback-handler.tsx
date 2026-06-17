"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  establishRecoverySession,
  stripRecoveryParamsFromUrl,
} from "@/lib/auth/recovery-session";
import {
  isRecoveryNext,
  RECOVERY_CALLBACK_NEXT,
  RECOVERY_PATHS,
} from "@/lib/auth/recovery";

/**
 * Legacy /auth/callback handler for OAuth and older recovery links.
 * Recovery always ends on /reset-password — never /forgot-password.
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
          RECOVERY_PATHS.callback,
        );

        if (cancelled) return;

        stripRecoveryParamsFromUrl();

        if (!result.ok) {
          const url = new URL(RECOVERY_CALLBACK_NEXT, window.location.origin);
          url.searchParams.set("recovery_error", result.reason);
          window.location.replace(url.toString());
          return;
        }

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
          window.location.replace("/login?signin=1");
          return;
        }

        window.location.replace(result.redirectTo);
        return;
      }

      console.error("[auth-callback:no-tokens]", {
        search: window.location.search,
        hash: Boolean(window.location.hash),
      });
      window.location.replace(RECOVERY_CALLBACK_NEXT);
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return <AuthLoadingScreen message="Verifying your reset link…" />;
}
