import { type NextRequest, NextResponse } from "next/server";

import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import { isProtectedPath } from "@/lib/auth/paths";
import { authDebug } from "@/lib/auth/profile";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch (error) {
    authDebug("middleware-fatal", {
      pathname: request.nextUrl.pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    const { pathname } = request.nextUrl;

    if (isProtectedPath(pathname)) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.search = "";

      if (isServiceUnavailableError(error)) {
        loginUrl.searchParams.set("error", AUTH_ERROR_CODES.unavailable);
      }
      loginUrl.searchParams.set("redirectTo", pathname);

      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next({ request });
  }
}

export const config = {
  matcher: [
    /*
     * Run auth middleware on app routes only.
     * Exclude static assets, images, and textures to avoid unnecessary Supabase calls.
     */
    "/((?!_next/static|_next/image|favicon.ico|assets/|textures|api/|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
