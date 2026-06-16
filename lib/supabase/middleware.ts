import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { tryRefreshSession } from "@/lib/auth/refresh-session";
import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import {
  applyNoStoreHeaders,
  clearSupabaseAuthCookies,
  hasSupabaseAuthCookies,
} from "@/lib/auth/cookies";
import {
  readAuthNoticeCookie,
  setAuthNoticeCookie,
  type AuthNoticeKind,
} from "@/lib/auth/notice";
import {
  AUTH_PATHS,
  getRedirectPathForRole,
  isAuthPath,
  isProtectedPath,
  isRecoveryPath,
  isSuperAdminOnlyPath,
  PROTECTED_PATHS,
} from "@/lib/auth/paths";
import { isStaffRole } from "@/lib/auth/staff";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { authDebug, authProfileTrace, isDisabledStaffGate } from "@/lib/auth/profile";
import {
  isInvalidSessionError,
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
  notice?: AuthNoticeKind,
  redirectTo?: string,
) {
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = AUTH_PATHS.login;
  loginUrl.search = "";

  if (redirectTo) {
    loginUrl.searchParams.set("redirectTo", redirectTo);
  }

  const response = NextResponse.redirect(loginUrl);
  applyNoStoreHeaders(response);

  if (notice) {
    setAuthNoticeCookie(response, notice);
    if (notice === "session_ended" || notice === "sign_in_required") {
      clearSupabaseAuthCookies(request, response);
    }
  }

  return response;
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
  authProfileTrace("middleware:loadProfileGate:start", { userId });

  try {
    const { profile, error } = await fetchProfileByUserId(supabase, userId);

    if (!profile) {
      authProfileTrace(
        "middleware:loadProfileGate:missing",
        { userId, fetchError: error },
        "error",
      );
      authDebug("middleware-profile-missing", { userId, error });
      return null;
    }

    authProfileTrace("middleware:loadProfileGate:ok", {
      userId,
      profileId: profile.id,
      role: profile.role,
    });

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
    authProfileTrace(
      "middleware:loadProfileGate:exception",
      {
        userId,
        message: error instanceof Error ? error.message : String(error),
      },
      "error",
    );
    authDebug("middleware-profile-error", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function repairProfileInMiddleware(
  supabase: ReturnType<typeof createServerClient>,
  userId: string,
): Promise<ProfileGate | null> {
  try {
    const { data, error } = await supabase.rpc("ensure_own_profile");

    if (error || !data) {
      authDebug("middleware-profile-repair-failed", {
        userId,
        error: error?.message ?? "no data",
      });
      return null;
    }

    authDebug("middleware-profile-repaired", { userId, profileId: data.id });

    return {
      role: data.role as UserRole,
      is_active: data.is_active ?? true,
      team_role: data.team_role ?? null,
    };
  } catch (error) {
    authDebug("middleware-profile-repair-exception", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const legacyError = request.nextUrl.searchParams.get("error");
  const existingNotice = readAuthNoticeCookie(request);

  // OAuth callback must run without middleware redirects or extra auth calls.
  if (pathname.startsWith("/auth/callback")) {
    return NextResponse.next({ request });
  }

  const client = createMiddlewareClient(request);
  if (!client) {
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, "sign_in_required", pathname);
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
    legacyError === AUTH_ERROR_CODES.unavailable &&
    !hasAuthCookies &&
    !existingNotice
  ) {
    return NextResponse.next({ request });
  }

  // No session cookies — skip Supabase auth call entirely.
  if (!hasAuthCookies) {
    if (isRecoveryPath(pathname)) {
      return getResponse();
    }
    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, "sign_in_required", pathname);
    }
    if (pathname === "/") {
      return redirectToLogin(request);
    }
    return getResponse();
  }

  let user: { id: string } | null = null;
  let sessionExpired = false;

  try {
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error && isInvalidSessionError(error)) {
      sessionExpired = true;
    }

    const resolved = resolveUserFromGetUser(authUser, error);

    if (resolved.unavailable) {
      authDebug("middleware-auth-unavailable", { pathname });
      if (isProtectedPath(pathname)) {
        // Allow through — login page will show a soft retry message.
        return getResponse();
      }
      return getResponse();
    }

    user = resolved.user;

    // Silent session recovery before treating as logged out.
    if (!user && sessionExpired) {
      const refreshed = await tryRefreshSession(supabase);
      if (refreshed) {
        const {
          data: { user: refreshedUser },
          error: refreshError,
        } = await supabase.auth.getUser();
        const refreshResolved = resolveUserFromGetUser(refreshedUser, refreshError);
        if (!refreshResolved.unavailable && refreshResolved.user) {
          user = refreshResolved.user;
          sessionExpired = false;
          authDebug("middleware-session-recovered", { userId: user.id });
        }
      }
    }

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
      return getResponse();
    }

    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, "sign_in_required", pathname);
    }
    return getResponse();
  }

  // --- Password recovery: never redirect away or block ---
  if (isRecoveryPath(pathname)) {
    return getResponse();
  }

  // --- Unauthenticated ---
  if (!user) {
    const notice: AuthNoticeKind = sessionExpired
      ? "session_ended"
      : "sign_in_required";

    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, notice, pathname);
    }
    if (pathname === "/") {
      return redirectToLogin(request, notice);
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

      if (!profile) {
        profile = await repairProfileInMiddleware(supabase, user.id);
      }
    } catch (error) {
      if (isServiceUnavailableError(error) && isProtectedPath(pathname)) {
        return getResponse();
      }
      if (isProtectedPath(pathname)) {
        return redirectToLogin(request, "sign_in_required", pathname);
      }
      return getResponse();
    }
  }

  const role = profile?.role ?? "client";

  // Disabled staff account (only when team_role is set — migration 004)
  if (profile && isDisabledStaffGate(profile)) {
    if (
      isAuthPath(pathname) &&
      (legacyError === AUTH_ERROR_CODES.disabled ||
        existingNotice === "sign_in_required")
    ) {
      return getResponse();
    }
    return redirectToLogin(request, "sign_in_required");
  }

  // Missing profile row — critical loop fix:
  // NEVER bounce authenticated users away from /login when profile is missing.
  if (!profile) {
    if (isAuthPath(pathname) || pathname === "/") {
      return getResponse();
    }

    if (isProtectedPath(pathname)) {
      return redirectToLogin(request, "sign_in_required", pathname);
    }

    return getResponse();
  }

  // Home: send authenticated users straight to their dashboard.
  if (pathname === "/") {
    return redirectToApp(request, getRedirectPathForRole(role));
  }

  // Auth pages: redirect into the app when profile is valid.
  if (isAuthPath(pathname)) {
    if (profile) {
      return redirectToApp(request, getRedirectPathForRole(role));
    }
    return getResponse();
  }

  // Role-based route protection
  if (pathname.startsWith(PROTECTED_PATHS.admin) && !isStaffRole(role)) {
    return redirectToApp(request, PROTECTED_PATHS.client);
  }

  if (
    (pathname === PROTECTED_PATHS.client ||
      pathname.startsWith(`${PROTECTED_PATHS.client}/`)) &&
    isStaffRole(role)
  ) {
    return redirectToApp(request, PROTECTED_PATHS.admin);
  }

  const isSuperAdmin =
    role === "super_admin" ||
    (role === "admin" && profile?.team_role === "super_admin");

  if (isSuperAdminOnlyPath(pathname) && !isSuperAdmin) {
    const denied = request.nextUrl.clone();
    denied.pathname = "/admin/access-denied";
    denied.search = "";
    return NextResponse.redirect(denied);
  }

  return getResponse();
}
