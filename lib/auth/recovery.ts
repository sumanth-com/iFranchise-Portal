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

export function buildPasswordResetRedirectUrl(origin: string): string {
  const url = new URL(RECOVERY_PATHS.callback, origin);
  url.searchParams.set("next", RECOVERY_CALLBACK_NEXT);
  return url.toString();
}
