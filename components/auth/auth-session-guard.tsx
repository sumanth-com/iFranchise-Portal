"use client";

import { useEffect } from "react";

/**
 * Re-validates session when the user returns via the back button (bfcache).
 * Redirects to login if the server session is gone.
 */
export function AuthSessionGuard() {
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (!event.persisted) return;

      void fetch("/api/auth/session", {
        cache: "no-store",
        credentials: "same-origin",
      }).then((response) => {
        if (response.status === 401) {
          const url = new URL("/login", window.location.origin);
          url.searchParams.set("error", "expired");
          window.location.replace(url.toString());
        }
      });
    }

    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
