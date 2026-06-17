"use client";

import { useEffect, useState, type ReactNode } from "react";

import { AuthLoadingScreen } from "@/components/auth/auth-loading-screen";
import {
  establishRecoverySession,
  stripRecoveryParamsFromUrl,
} from "@/lib/auth/recovery-session";
import {
  parseRecoveryParams,
  type RecoveryErrorReason,
} from "@/lib/auth/recovery";
import { markRecoveryFlow } from "@/lib/auth/recovery-cookie";

type RecoverySessionBootstrapProps = {
  hasServerSession: boolean;
  children: (state: {
    sessionReady: boolean;
    errorReason: RecoveryErrorReason | null;
  }) => ReactNode;
};

/**
 * Verifies or establishes a recovery session before rendering the reset form.
 * Handles tokens delivered in the URL hash or query string on /reset-password.
 */
export function RecoverySessionBootstrap({
  hasServerSession,
  children,
}: RecoverySessionBootstrapProps) {
  const [sessionReady, setSessionReady] = useState(hasServerSession);
  const [errorReason, setErrorReason] = useState<RecoveryErrorReason | null>(
    null,
  );
  const [checking, setChecking] = useState(!hasServerSession);

  useEffect(() => {
    if (hasServerSession) {
      markRecoveryFlow();
      setSessionReady(true);
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function bootstrap() {
      const pathname = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const recoveryError = searchParams.get("recovery_error");

      if (
        recoveryError === "missing" ||
        recoveryError === "expired" ||
        recoveryError === "used" ||
        recoveryError === "invalid" ||
        recoveryError === "rate_limited" ||
        recoveryError === "unavailable"
      ) {
        stripRecoveryParamsFromUrl();
        setSessionReady(false);
        setErrorReason(recoveryError);
        setChecking(false);
        return;
      }

      const params = parseRecoveryParams(
        window.location.search,
        window.location.hash,
        pathname,
      );

      const hasTokens =
        Boolean(params.code) ||
        Boolean(params.tokenHash) ||
        Boolean(params.accessToken);

      if (hasTokens) {
        const result = await establishRecoverySession(
          window.location.search,
          window.location.hash,
          pathname,
        );

        if (cancelled) return;

        stripRecoveryParamsFromUrl();

        if (result.ok) {
          setSessionReady(true);
          setErrorReason(null);
        } else {
          setSessionReady(false);
          setErrorReason(result.reason);
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
          markRecoveryFlow();
          setSessionReady(true);
          setErrorReason(null);
        } else {
          setSessionReady(false);
          setErrorReason("missing");
        }
      } catch {
        if (!cancelled) {
          setSessionReady(false);
          setErrorReason("unavailable");
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
    return <AuthLoadingScreen message="Verifying your reset link…" />;
  }

  return <>{children({ sessionReady, errorReason })}</>;
}
