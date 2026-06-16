"use client";

import { useEffect } from "react";

/**
 * Re-validates session when the user returns via the back button (bfcache).
 * Attempts silent refresh before redirecting to login.
 */
export function AuthSessionGuard() {
  useEffect(() => {
    async function recoverOrRedirect() {
      try {
        const refresh = await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });

        if (refresh.ok) {
          return;
        }

        const session = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (session.ok) {
          return;
        }
      } catch {
        // Fall through to login redirect.
      }

      const redirectTo = encodeURIComponent(
        window.location.pathname + window.location.search,
      );
      window.location.replace(
        `/api/auth/redirect-login?notice=session_ended&redirectTo=${redirectTo}`,
      );
    }

    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;
      void recoverOrRedirect();
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
