"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  establishRecoverySession,
  stripRecoveryParamsFromUrl,
} from "@/lib/auth/recovery-session";
import { parseRecoveryParams } from "@/lib/auth/recovery";

type RecoverySessionBootstrapProps = {
  hasServerSession: boolean;
  children: (state: {
    sessionReady: boolean;
    sessionFailed: boolean;
  }) => ReactNode;
};

/**
 * Verifies or establishes a recovery session before rendering the reset form.
 * Handles tokens delivered in the URL hash or query string.
 */
export function RecoverySessionBootstrap({
  hasServerSession,
  children,
}: RecoverySessionBootstrapProps) {
  const [sessionReady, setSessionReady] = useState(hasServerSession);
  const [sessionFailed, setSessionFailed] = useState(false);
  const [checking, setChecking] = useState(!hasServerSession);

  useEffect(() => {
    if (hasServerSession) {
      setSessionReady(true);
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      const params = parseRecoveryParams(
        window.location.search,
        window.location.hash,
      );

      const hasTokens =
        Boolean(params.code) ||
        Boolean(params.tokenHash) ||
        Boolean(params.accessToken);

      if (hasTokens) {
        const result = await establishRecoverySession(
          window.location.search,
          window.location.hash,
        );

        if (cancelled) return;

        stripRecoveryParamsFromUrl();

        if (result.ok) {
          setSessionReady(true);
          setSessionFailed(false);
        } else {
          setSessionReady(false);
          setSessionFailed(true);
        }
        setChecking(false);
        return;
      }

      try {
        const response = await fetch("/api/auth/session", {
          cache: "no-store",
          credentials: "same-origin",
        });

        if (cancelled) return;

        if (response.ok) {
          setSessionReady(true);
          setSessionFailed(false);
        } else {
          setSessionReady(false);
          setSessionFailed(true);
        }
      } catch {
        if (!cancelled) {
          setSessionReady(false);
          setSessionFailed(true);
        }
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, [hasServerSession]);

  if (checking) {
    return <AuthLoadingScreen message="Preparing password reset…" />;
  }

  return <>{children({ sessionReady, sessionFailed })}</>;
}
