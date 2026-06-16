"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  exchangeCallbackCode,
  exchangeRecoveryCode,
} from "@/lib/auth/actions";
import {
  isRecoveryCallbackType,
  RECOVERY_CALLBACK_NEXT,
} from "@/lib/auth/recovery";
import { isSafeRedirectPath } from "@/lib/auth/paths";
import { createClientOptional } from "@/lib/supabase/client";

const RECOVERY_COOKIE = "if_auth_recovery";

function markRecoveryFlow() {
  document.cookie = `${RECOVERY_COOKIE}=1; path=/; max-age=3600; SameSite=Lax`;
}

function isRecoveryNext(next: string | null): boolean {
  return next === RECOVERY_CALLBACK_NEXT || next === "/reset-password";
}

/**
 * Handles Supabase redirects that deliver session tokens in the URL hash
 * (#access_token=...) — invisible to server route handlers.
 * Also supports ?code= PKCE when a verifier cookie is present.
 */
export function AuthCallbackHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const supabase = createClientOptional();
      if (!supabase) {
        window.location.replace("/forgot-password");
        return;
      }

      const next = searchParams.get("next");
      const code = searchParams.get("code");
      const hash = window.location.hash.replace(/^#/, "");
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const callbackType = hashParams.get("type");
      const isRecovery =
        isRecoveryCallbackType(callbackType) || isRecoveryNext(next);

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (cancelled) return;

        if (error) {
          console.error("[auth-callback:hash-setSession]", {
            message: error.message,
            code: error.code,
            status: error.status,
          });
          window.location.replace("/forgot-password");
          return;
        }

        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );

        if (isRecovery) {
          markRecoveryFlow();
          window.location.replace(RECOVERY_CALLBACK_NEXT);
          return;
        }

        const destination = isSafeRedirectPath(next) ? next : "/login";
        window.location.replace(destination);
        return;
      }

      if (code) {
        if (isRecovery) {
          const result = await exchangeRecoveryCode(code);

          if (cancelled) return;

          if (!result.ok) {
            console.error("[auth-callback:recovery-exchange]", result);
            window.location.replace("/forgot-password");
            return;
          }

          markRecoveryFlow();
          window.location.replace(RECOVERY_CALLBACK_NEXT);
          return;
        }

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
        hasHash: Boolean(hash),
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
