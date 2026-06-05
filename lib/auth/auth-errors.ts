export const AUTH_ERROR_CODES = {
  auth: "auth",
  profile: "profile",
  disabled: "disabled",
  unavailable: "unavailable",
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

export function getAuthErrorMessage(error: string | null | undefined): string | null {
  switch (error) {
    case AUTH_ERROR_CODES.auth:
      return "Authentication failed. Please try again.";
    case AUTH_ERROR_CODES.profile:
      return "Your profile could not be loaded. Please sign out and contact support if this continues.";
    case AUTH_ERROR_CODES.disabled:
      return "Your account is disabled. Contact an administrator.";
    case AUTH_ERROR_CODES.unavailable:
      return "We could not reach the authentication service. Check your connection and try again.";
    default:
      return null;
  }
}
