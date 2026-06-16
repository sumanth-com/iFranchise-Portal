import { type NextRequest, NextResponse } from "next/server";

import {
  clearAuthNoticeCookie,
  setAuthNoticeCookie,
  type AuthNoticeKind,
} from "@/lib/auth/notice";
import {
  applyNoStoreHeaders,
  clearSupabaseAuthCookies,
} from "@/lib/auth/cookies";
import { isSafeRedirectPath } from "@/lib/auth/paths";

const VALID_NOTICES = new Set<AuthNoticeKind>([
  "session_ended",
  "sign_in_required",
  "signed_out",
]);

/**
 * Sets an ephemeral auth notice cookie and redirects to /login.
 * Avoids exposing technical ?error= codes in the URL.
 */
export async function GET(request: NextRequest) {
  const notice = request.nextUrl.searchParams.get("notice");
  const redirectTo = request.nextUrl.searchParams.get("redirectTo");

  const loginUrl = new URL("/login", request.url);
  loginUrl.search = "";

  if (isSafeRedirectPath(redirectTo)) {
    loginUrl.searchParams.set("redirectTo", redirectTo);
  }

  const response = NextResponse.redirect(loginUrl);
  applyNoStoreHeaders(response);

  if (notice && VALID_NOTICES.has(notice as AuthNoticeKind)) {
    setAuthNoticeCookie(response, notice as AuthNoticeKind);
  } else {
    clearAuthNoticeCookie(response);
  }

  if (notice === "session_ended" || notice === "sign_in_required") {
    clearSupabaseAuthCookies(request, response);
  }

  return response;
}
