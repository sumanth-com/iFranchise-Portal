"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import { exchangeCallbackCode } from "@/lib/auth/actions";
import { isSafeRedirectPath } from "@/lib/auth/paths";
import { createClientOptional } from "@/lib/supabase/client";

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
        window.location.replace(
          "/api/auth/redirect-login?notice=sign_in_required",
        );
        return;
      }

      const next = searchParams.get("next");
      const code = searchParams.get("code");
      const hash = window.location.hash.replace(/^#/, "");
      const hashParams = new URLSearchParams(hash);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const destination = isSafeRedirectPath(next) ? next : "/login";

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
          window.location.replace(
            "/api/auth/redirect-login?notice=sign_in_required",
          );
          return;
        }

        window.history.replaceState(
          null,
          "",
          window.location.pathname + window.location.search,
        );
        window.location.replace(destination);
        return;
      }

      if (code) {
        const result = await exchangeCallbackCode(code, next);

        if (cancelled) return;

        if (!result.ok) {
          console.error("[auth-callback:code-exchange]", {
            error: result.error,
          });
          const notice =
            result.error === "unavailable"
              ? "sign_in_required"
              : "sign_in_required";
          window.location.replace(
            `/api/auth/redirect-login?notice=${notice}`,
          );
          return;
        }

        window.location.replace(result.redirectTo);
        return;
      }

      console.error("[auth-callback:no-tokens]", {
        search: window.location.search,
        hasHash: Boolean(hash),
      });
      window.location.replace(
        "/api/auth/redirect-login?notice=sign_in_required",
      );
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return <AuthLoadingScreen message="Securing your workspace…" />;
}
