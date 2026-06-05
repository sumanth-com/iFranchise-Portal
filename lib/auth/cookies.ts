import type { NextRequest } from "next/server";

/** True when Supabase SSR auth cookies are present on the request. */
export function hasSupabaseAuthCookies(request: NextRequest): boolean {
  return request.cookies.getAll().some((cookie) => {
    const name = cookie.name;
    return name.includes("-auth-token") || name.startsWith("sb-");
  });
}
