"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [status, setStatus] = useState("Completing sign-in…");

  useEffect(() => {
    let cancelled = false;

    async function completeAuth() {
      const supabase = createClientOptional();
      if (!supabase) {
        window.location.replace("/login?error=unavailable");
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
        setStatus("Setting session from recovery link…");
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
          window.location.replace("/login?error=auth");
          return;
        }

        window.history.replaceState(null, "", window.location.pathname + window.location.search);
        window.location.replace(destination);
        return;
      }

      if (code) {
        setStatus("Exchanging authorization code…");
        const result = await exchangeCallbackCode(code, next);

        if (cancelled) return;

        if (!result.ok) {
          console.error("[auth-callback:code-exchange]", { error: result.error });
          window.location.replace(`/login?error=${result.error}`);
          return;
        }

        window.location.replace(result.redirectTo);
        return;
      }

      console.error("[auth-callback:no-tokens]", {
        search: window.location.search,
        hasHash: Boolean(hash),
      });
      window.location.replace("/login?error=auth");
    }

    void completeAuth();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-sm text-slate-600">{status}</p>
    </div>
  );
}
