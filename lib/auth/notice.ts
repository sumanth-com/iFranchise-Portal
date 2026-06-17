import type { NextRequest, NextResponse } from "next/server";

/** Ephemeral cookie for user-facing auth notices — never expose technical error codes. */
export const AUTH_NOTICE_COOKIE = "if_auth_notice";

export type AuthNoticeKind =
  | "session_ended"
  | "sign_in_required"
  | "signed_out"
  | "password_updated";

export function getAuthNoticeMessage(
  kind: AuthNoticeKind | null | undefined,
): string | null {
  switch (kind) {
    case "session_ended":
      return "Your session has ended. Sign in again to continue.";
    case "sign_in_required":
      return "Please sign in to continue.";
    case "signed_out":
      return "You have been signed out successfully.";
    case "password_updated":
      return "Password updated successfully.";
    default:
      return null;
  }
}

/** Map legacy ?error= query params to friendly notice kinds (backward compat). */
export function legacyErrorToNotice(
  error: string | null | undefined,
): AuthNoticeKind | null {
  switch (error) {
    case "expired":
      return "session_ended";
    case "auth":
    case "profile":
    case "disabled":
      return "sign_in_required";
    default:
      return null;
  }
}

export function setAuthNoticeCookie(
  response: NextResponse,
  kind: AuthNoticeKind,
): void {
  response.cookies.set(AUTH_NOTICE_COOKIE, kind, {
    path: "/",
    maxAge: 120,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export function readAuthNoticeCookie(
  request: NextRequest,
): AuthNoticeKind | null {
  const value = request.cookies.get(AUTH_NOTICE_COOKIE)?.value;
  if (
    value === "session_ended" ||
    value === "sign_in_required" ||
    value === "signed_out" ||
    value === "password_updated"
  ) {
    return value;
  }
  return null;
}

export function clearAuthNoticeCookie(response: NextResponse): void {
  response.cookies.set(AUTH_NOTICE_COOKIE, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}
