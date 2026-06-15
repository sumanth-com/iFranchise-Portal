import type { NextRequest, NextResponse } from "next/server";

/** True when Supabase SSR auth cookies are present on the request. */
export function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return name.includes("-auth-token") || name.startsWith("sb-");
  });
}

/** Strip Supabase auth cookies from a redirect/API response. */
export function clearSupabaseAuthCookies(
  request: NextRequest,
  response: NextResponse,
): void {
  for (const cookie of request.cookies.getAll()) {
    const name = cookie.name;
    if (name.includes("-auth-token") || name.startsWith("sb-")) {
      response.cookies.set(name, "", {
        path: "/",
        maxAge: 0,
        expires: new Date(0),
      });
    }
  }
}

export function applyNoStoreHeaders(response: NextResponse): void {
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
}
