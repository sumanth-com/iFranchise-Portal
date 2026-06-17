import type { NextRequest } from "next/server";

export const RECOVERY_COOKIE = "if_auth_recovery";

export const RECOVERY_PATHS = {
  resetPassword: "/reset-password",
  callback: "/auth/callback",
} as const;

export const RECOVERY_CALLBACK_NEXT = RECOVERY_PATHS.resetPassword;

export function isRecoveryPath(pathname: string): boolean {
  return (
    pathname === RECOVERY_PATHS.resetPassword ||
    pathname.startsWith(`${RECOVERY_PATHS.resetPassword}/`)
  );
}

export function isRecoveryCallbackType(type: string | null | undefined): boolean {
  return type === "recovery";
}

export function isRecoveryNext(next: string | null | undefined): boolean {
  return next === RECOVERY_CALLBACK_NEXT || next === RECOVERY_PATHS.resetPassword;
}

export function hasRecoveryCookie(request: NextRequest): boolean {
  return request.cookies.get(RECOVERY_COOKIE)?.value === "1";
}

/**
 * True when the request is part of a password recovery flow (before or after
 * session establishment). Used by middleware to avoid session_ended redirects.
 */
export function isRecoveryRequest(request: NextRequest): boolean {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname.startsWith(RECOVERY_PATHS.callback)) {
    return true;
  }

  if (isRecoveryPath(pathname)) {
    return true;
  }

  if (hasRecoveryCookie(request)) {
    return true;
  }

  if (isRecoveryCallbackType(searchParams.get("type"))) {
    return true;
  }

  if (searchParams.has("token_hash") && isRecoveryCallbackType(searchParams.get("type"))) {
    return true;
  }

  if (isRecoveryNext(searchParams.get("next"))) {
    return true;
  }

  if (
    searchParams.has("code") &&
    (pathname === "/login" || pathname === "/")
  ) {
    return true;
  }

  return false;
}

export function buildPasswordResetRedirectUrl(origin: string): string {
  const url = new URL(RECOVERY_PATHS.callback, origin);
  url.searchParams.set("next", RECOVERY_CALLBACK_NEXT);
  return url.toString();
}

export type RecoveryUrlParams = {
  code: string | null;
  tokenHash: string | null;
  type: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  next: string | null;
  isRecovery: boolean;
};

/** Parse recovery-related params from search string and URL hash (client-only hash). */
export function parseRecoveryParams(
  search: string,
  hash = "",
): RecoveryUrlParams {
  const searchParams = new URLSearchParams(search.replace(/^\?/, ""));
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  const type = hashParams.get("type") ?? searchParams.get("type");
  const next = searchParams.get("next");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  const isRecovery =
    isRecoveryCallbackType(type) ||
    isRecoveryNext(next) ||
    Boolean(accessToken && isRecoveryCallbackType(type));

  return {
    code,
    tokenHash,
    type,
    accessToken,
    refreshToken,
    next,
    isRecovery,
  };
}

export function validateRecoveryPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password || !confirmPassword) {
    return "Please enter and confirm your new password.";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return null;
}
