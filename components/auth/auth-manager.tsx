"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

import { AuthSessionGuard } from "@/components/auth/auth-session-guard";

type AuthManagerProps = {
  children?: ReactNode;
};

/**
 * Client-side auth resilience: bfcache recovery, tab focus refresh,
 * and silent session restoration before any login redirect.
 */
export function AuthManager({ children }: AuthManagerProps) {
  useEffect(() => {
    async function silentRefresh() {
      try {
        await fetch("/api/auth/refresh", {
          method: "POST",
          cache: "no-store",
          credentials: "same-origin",
        });
      } catch {
        // Ignore — middleware handles hard failures on navigation.
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible") {
        void silentRefresh();
      }
    }

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <>
      <AuthSessionGuard />
      {children}
    </>
  );
}
