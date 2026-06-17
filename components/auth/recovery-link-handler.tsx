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
 * On /login (or /), detect recovery tokens in the URL and route to reset-password
 * instead of showing a stale "session ended" message.
 */
export function RecoveryLinkHandler() {
  useEffect(() => {
    const params = parseRecoveryParams(
      window.location.search,
      window.location.hash,
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
      const result = await establishRecoverySession(
        window.location.search,
        window.location.hash,
      );

      if (cancelled) return;

      stripRecoveryParamsFromUrl();

      if (result.ok) {
        markRecoveryFlow();
        window.location.replace(getRecoveryDestination());
        return;
      }

      window.location.replace("/forgot-password");
    }

    void handleRecoveryLink();

    return () => {
      cancelled = true;
    };
  }, []);

  const params =
    typeof window !== "undefined"
      ? parseRecoveryParams(window.location.search, window.location.hash)
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

  return <AuthLoadingScreen message="Preparing password reset…" />;
}
