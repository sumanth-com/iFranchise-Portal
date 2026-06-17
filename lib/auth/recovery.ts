import type { NextRequest } from "next/server";

import {
  PASSWORD_REQUIREMENTS,
  type PasswordStrength,
} from "@/lib/auth/password-policy";

export const RECOVERY_COOKIE = "if_auth_recovery";

export const RECOVERY_PATHS = {
  resetPassword: "/reset-password",
  callback: "/auth/callback",
} as const;

export const RECOVERY_CALLBACK_NEXT = RECOVERY_PATHS.resetPassword;

/** Production reset URL — used when origin cannot be inferred. */
export const PRODUCTION_RESET_PASSWORD_URL =
  "https://ifranchise-portal.vercel.app/reset-password";

export const LOCAL_RESET_PASSWORD_URL = "http://localhost:3000/reset-password";

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

  if (searchParams.has("token_hash")) {
    return true;
  }

  if (isRecoveryNext(searchParams.get("next"))) {
    return true;
  }

  if (
    searchParams.has("code") &&
    (pathname === "/login" || pathname === "/" || isRecoveryPath(pathname))
  ) {
    return true;
  }

  return false;
}

/**
 * Build the Supabase resetPasswordForEmail redirectTo URL.
 * Links open /reset-password directly (no intermediate callback).
 */
export function buildPasswordResetRedirectUrl(origin: string): string {
  const base = origin.replace(/\/$/, "");
  return `${base}${RECOVERY_PATHS.resetPassword}`;
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

export function parseRecoveryParams(
  search = "",
  hash = "",
  pathname = "",
): RecoveryUrlParams {
  const searchParams = new URLSearchParams(search.replace(/^\?/, ""));
  const hashParams = new URLSearchParams(hash.replace(/^#/, ""));

  const type = hashParams.get("type") ?? searchParams.get("type");
  const next = searchParams.get("next");
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const accessToken = hashParams.get("access_token");
  const refreshToken = hashParams.get("refresh_token");

  const hasTokens = Boolean(code || tokenHash || (accessToken && refreshToken));

  const isRecovery =
    isRecoveryCallbackType(type) ||
    isRecoveryNext(next) ||
    (isRecoveryPath(pathname) && hasTokens) ||
    Boolean(accessToken && refreshToken && isRecoveryCallbackType(type));

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

export type RecoveryErrorReason =
  | "missing"
  | "expired"
  | "used"
  | "invalid"
  | "rate_limited"
  | "unavailable";

export function classifyRecoveryError(
  code: string | null | undefined,
  message: string | null | undefined,
): RecoveryErrorReason {
  const normalized = (code ?? "").toLowerCase();
  const lower = (message ?? "").toLowerCase();

  if (
    normalized.includes("rate") ||
    lower.includes("rate limit") ||
    lower.includes("too many")
  ) {
    return "rate_limited";
  }

  if (
    normalized === "otp_expired" ||
    normalized === "session_expired" ||
    normalized === "flow_state_expired" ||
    normalized === "flow_state_not_found" ||
    lower.includes("expired")
  ) {
    return "expired";
  }

  if (
    normalized === "otp_disabled" ||
    lower.includes("already been used") ||
    lower.includes("already used")
  ) {
    return "used";
  }

  if (normalized === "validation_failed" || normalized === "invalid_grant") {
    return "invalid";
  }

  return "invalid";
}

export function getRecoveryErrorMessage(reason: RecoveryErrorReason): string {
  switch (reason) {
    case "missing":
      return "No reset token was found. Open the link from your password reset email.";
    case "expired":
      return "This password reset link has expired.";
    case "used":
      return "This password reset link has already been used.";
    case "rate_limited":
      return "Too many attempts. Please wait a few minutes, then request a new link.";
    case "unavailable":
      return "We could not verify your reset link right now. Please try again shortly.";
    case "invalid":
    default:
      return "This password reset link is invalid.";
  }
}

/** Recovery passwords: 8+ chars, upper, lower, number (no special char required). */
export const RECOVERY_PASSWORD_REQUIREMENTS = PASSWORD_REQUIREMENTS.filter(
  (req) => req.id !== "special",
);

export function evaluateRecoveryPasswordStrength(password: string): PasswordStrength {
  const requirements = RECOVERY_PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    met: req.test(password),
  }));
  const metCount = requirements.filter((r) => r.met).length;
  const passed = metCount === requirements.length;

  let label: PasswordStrength["label"] = "Weak";
  if (metCount >= 4) label = "Strong";
  else if (metCount >= 3) label = "Good";
  else if (metCount >= 2) label = "Fair";

  return {
    score: metCount,
    label,
    passed,
    requirements,
  };
}

export function validateRecoveryPassword(
  password: string,
  confirmPassword: string,
): string | null {
  if (!password || !confirmPassword) {
    return "Please enter and confirm your new password.";
  }

  const strength = evaluateRecoveryPasswordStrength(password);
  if (!strength.passed) {
    const firstMissing = strength.requirements.find((r) => !r.met);
    return firstMissing
      ? `Password must include ${firstMissing.label.toLowerCase()}.`
      : "Password does not meet security requirements.";
  }

  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }

  return null;
}
