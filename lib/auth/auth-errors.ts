export const AUTH_ERROR_CODES = {
  auth: "auth",
  profile: "profile",
  disabled: "disabled",
  unavailable: "unavailable",
  expired: "expired",
} as const;

export type AuthErrorCode =
  (typeof AUTH_ERROR_CODES)[keyof typeof AUTH_ERROR_CODES];

/** Errors that must keep the user on the login page (no auto-redirect to app). */
export const BLOCKING_AUTH_ERRORS = new Set<AuthErrorCode>([
  AUTH_ERROR_CODES.auth,
  AUTH_ERROR_CODES.profile,
  AUTH_ERROR_CODES.disabled,
  AUTH_ERROR_CODES.unavailable,
]);

export function isBlockingAuthError(
  error: string | null | undefined,
): error is AuthErrorCode {
  return (
    typeof error === "string" &&
    BLOCKING_AUTH_ERRORS.has(error as AuthErrorCode)
  );
}

/** User-facing copy only — never expose technical failure details. */
export function getAuthErrorMessage(error: string | null | undefined): string | null {
  switch (error) {
    case AUTH_ERROR_CODES.auth:
    case AUTH_ERROR_CODES.profile:
    case AUTH_ERROR_CODES.disabled:
      return "Please sign in to continue.";
    case AUTH_ERROR_CODES.unavailable:
      return "We are having trouble connecting. Please try again in a moment.";
    case AUTH_ERROR_CODES.expired:
      return "Your session has ended. Sign in again to continue.";
    default:
      return null;
  }
}
