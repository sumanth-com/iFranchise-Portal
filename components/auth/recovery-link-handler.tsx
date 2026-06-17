"use client";

import { useEffect } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  establishRecoverySession,
  getRecoveryDestination,
  stripRecoveryParamsFromUrl,
} from "@/lib/auth/recovery-session";
import { parseRecoveryParams } from "@/lib/auth/recovery";
import { markRecoveryFlow } from "@/lib/auth/recovery-cookie";

/**
 * On /login or /, detect recovery tokens and forward to /reset-password
 * without showing session-expired errors.
 */
export function RecoveryLinkHandler() {
  useEffect(() => {
    const params = parseRecoveryParams(
      window.location.search,
      window.location.hash,
      window.location.pathname,
    );

    const hasTokens =
      Boolean(params.code) ||
      Boolean(params.tokenHash) ||
      Boolean(params.accessToken);

    if (!hasTokens && !params.isRecovery) {
      return;
    }

    let cancelled = false;

    async function handleRecoveryLink() {
      const pathname = window.location.pathname;

      if (pathname !== getRecoveryDestination()) {
        const destination = new URL(getRecoveryDestination(), window.location.origin);
        destination.search = window.location.search;
        destination.hash = window.location.hash;
        window.location.replace(destination.toString());
        return;
      }

      const result = await establishRecoverySession(
        window.location.search,
        window.location.hash,
        pathname,
      );

      if (cancelled) return;

      stripRecoveryParamsFromUrl();

      if (result.ok) {
        markRecoveryFlow();
        window.location.replace(getRecoveryDestination());
      }
    }

    void handleRecoveryLink();

    return () => {
      cancelled = true;
    };
  }, []);

  const params =
    typeof window !== "undefined"
      ? parseRecoveryParams(
          window.location.search,
          window.location.hash,
          window.location.pathname,
        )
      : null;

  const hasRecoveryIntent =
    params &&
    (params.isRecovery ||
      Boolean(params.code) ||
      Boolean(params.tokenHash) ||
      Boolean(params.accessToken));

  if (!hasRecoveryIntent) {
    return null;
  }

  return <AuthLoadingScreen message="Verifying your reset link…" />;
}
