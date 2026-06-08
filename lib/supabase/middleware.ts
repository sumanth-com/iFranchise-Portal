import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  AUTH_ERROR_CODES,
  isBlockingAuthError,
} from "@/lib/auth/auth-errors";
import { hasSupabaseAuthCookies } from "@/lib/auth/cookies";
import {
  AUTH_PATHS,
  getRedirectPathForRole,
  isAuthPath,
  isProtectedPath,
  PROTECTED_PATHS,
} from "@/lib/auth/paths";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { authDebug, isDisabledStaffGate } from "@/lib/auth/profile";
import {
  isServiceUnavailableError,
  resolveUserFromGetUser,
} from "@/lib/auth/resolve-auth";
import type { UserRole } from "@/types/auth";
import type { TeamRole } from "@/types/team";

import { getSupabaseEnv } from "./env";
import { fetchWithTimeoutMiddleware } from "./fetch";

type ProfileGate = {
  role: UserRole;
  is_active: boolean;
  team_role: TeamRole | null;
};

function createMiddlewareClient(request: NextRequest) {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    return null;
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, publishableKey, {
    global: { fetch: fetchWithTimeoutMiddleware },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, getResponse: () => supabaseResponse };
}

function redirectToLogin(
  request: NextRequest,
  error?: string,
  redirectTo?: string,
) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = AUTH_PATHS.login;
  loginUrl.search = "";

  if (error) {
    loginUrl.searchParams.set("error", error);
  }
  if (redirectTo) {
    loginUrl.searchParams.set("redirectTo", redirectTo);
  }

  return NextResponse.redirect(loginUrl);
}

function redirectToApp(request: NextRequest, pathname: string) {
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = pathname;
  redirectUrl.search = "";
  return NextResponse.redirect(redirectUrl);
}

async function loadProfileGate(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<ProfileGate | null> {
  try {
    const { profile, error } = await fetchProfileByUserId(supabase, userId);

    if (!profile) {
      authDebug("middleware-profile-missing", { userId, error });
      return null;
    }

    authDebug("middleware-profile-ok", {
      userId,
      profileId: profile.id,
      role: profile.role,
    });

    return {
      role: profile.role,
      is_active: profile.is_active,
      team_role: profile.team_role,
    };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      throw error;
    }
    authDebug("middleware-profile-error", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authError = request.nextUrl.searchParams.get("error");

  // OAuth callback must run without middleware redirects or extra auth calls.
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  const client = createMiddlewareClient(request);
  if (!client) {
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, AUTH_ERROR_CODES.unavailable, pathname);
    }
    if (pathname === "/") {
      return redirectToLogin(request);
    }
    return NextResponse.next({ request });
  }

  const { supabase, getResponse } = client;
  const hasAuthCookies = hasSupabaseAuthCookies(request);

  // Fast path: login with a service error and no session cookies — nothing
  // to recover; skip a slow Supabase round-trip on every refresh.
  if (
    isAuthPath(pathname) &&
    authError === AUTH_ERROR_CODES.unavailable &&
    !hasAuthCookies
  ) {
    return NextResponse.next({ request });
  }

  // No session cookies — skip Supabase auth call entirely.
  if (!hasAuthCookies) {
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, undefined, pathname);
    }
    if (pathname === "/") {
      return redirectToLogin(request);
    }
    return getResponse();
  }

  let user: { id: string } | null = null;

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    const resolved = resolveUserFromGetUser(authUser, error);

    if (resolved.unavailable) {
      authDebug("middleware-auth-unavailable", { pathname });
      if (isProtectedPath(pathname)) {
        return redirectToLogin(request, AUTH_ERROR_CODES.unavailable, pathname);
      }
      return getResponse();
    }

    user = resolved.user;
    authDebug("middleware-user", {
      userId: user?.id ?? null,
      pathname,
    });
  } catch (error) {
    authDebug("middleware-auth-error", {
      pathname,
      error: error instanceof Error ? error.message : String(error),
    });

    if (isServiceUnavailableError(error) && isProtectedPath(pathname)) {
      return redirectToLogin(request, AUTH_ERROR_CODES.unavailable, pathname);
    }

    // Network / unknown failures — treat as logged out, never loop on "unavailable".
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, undefined, pathname);
    }
    return getResponse();
  }

  // --- Unauthenticated ---
  if (!user) {
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, undefined, pathname);
    }
    if (pathname === "/") {
      return redirectToLogin(request);
    }
    return getResponse();
  }

  // --- Authenticated: resolve profile once per request ---
  let profile: ProfileGate | null = null;

  const needsProfile =
    isProtectedPath(pathname) ||
    isAuthPath(pathname) ||
    pathname === "/" ||
    pathname.startsWith(PROTECTED_PATHS.admin);

  if (needsProfile) {
    try {
      profile = await loadProfileGate(supabase, user.id);
    } catch (error) {
      if (isServiceUnavailableError(error) && isProtectedPath(pathname)) {
        return redirectToLogin(request, AUTH_ERROR_CODES.unavailable, pathname);
      }
      if (isProtectedPath(pathname)) {
        return redirectToLogin(request, AUTH_ERROR_CODES.profile, pathname);
      }
      return getResponse();
    }
  }

  const role = profile?.role ?? "client";

  // Disabled staff account (only when team_role is set — migration 004)
  if (profile && isDisabledStaffGate(profile)) {
    if (isAuthPath(pathname) && authError === AUTH_ERROR_CODES.disabled) {
      return getResponse();
    }
    return redirectToLogin(request, AUTH_ERROR_CODES.disabled);
  }

  // Missing profile row — critical loop fix:
  // NEVER bounce authenticated users away from /login when profile is missing.
  if (!profile) {
    if (isAuthPath(pathname) || pathname === "/") {
      return getResponse();
    }

    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, AUTH_ERROR_CODES.profile, pathname);
    }

    return getResponse();
  }

  // Home: send authenticated users straight to their dashboard.
  if (pathname === "/") {
    return redirectToApp(request, getRedirectPathForRole(role));
  }

  // Auth pages: redirect into the app when profile is valid. Treat stale
  // ?error=unavailable as non-blocking once session + profile resolve.
  if (isAuthPath(pathname)) {
    const blockingError =
      isBlockingAuthError(authError) &&
      authError !== AUTH_ERROR_CODES.unavailable;

    if (blockingError) {
      return getResponse();
    }

    return redirectToApp(request, getRedirectPathForRole(role));
  }

  // Role-based route protection
  if (pathname.startsWith(PROTECTED_PATHS.admin) && role !== "admin") {
    return redirectToApp(request, PROTECTED_PATHS.client);
  }

  if (
    (pathname === PROTECTED_PATHS.client ||
      pathname.startsWith(`${PROTECTED_PATHS.client}/`)) &&
    role === "admin"
  ) {
    return redirectToApp(request, PROTECTED_PATHS.admin);
  }

  return getResponse();
}
