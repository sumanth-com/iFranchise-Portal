import { type NextRequest, NextResponse } from "next/server";

import { setAuthNoticeCookie } from "@/lib/auth/notice";
import { applyNoStoreHeaders } from "@/lib/auth/cookies";
import { isProtectedPath } from "@/lib/auth/paths";
import { authDebug } from "@/lib/auth/profile";
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
      loginUrl.searchParams.set("redirectTo", pathname);

      const response = NextResponse.redirect(loginUrl);
      applyNoStoreHeaders(response);
      setAuthNoticeCookie(response, "sign_in_required");
      return response;
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
    "/((?!_next/static|_next/image|favicon.ico|assets/|textures|api/|auth/callback|dev-login|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
