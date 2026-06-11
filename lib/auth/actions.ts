"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import {
  humanizeAuthError,
  profileLoadErrorMessage,
  unavailableAuthState,
} from "@/lib/auth/humanize-error";
import { authDebug, authProfileTrace } from "@/lib/auth/profile";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import { verifySupabaseConnectivity } from "@/lib/supabase/connectivity";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";
import { createClientOptional } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

function envErrorState(): AuthActionState {
  const status = getSupabaseEnvStatus();
  return {
    error:
      status.issues[0] ??
      "Authentication is not configured. Check environment variables.",
    message: null,
  };
}

async function preflightAuth(): Promise<AuthActionState | null> {
  const envStatus = getSupabaseEnvStatus();
  if (!envStatus.configured) {
    return envErrorState();
  }

  const connectivity = await verifySupabaseConnectivity();
  if (!connectivity.ok) {
    authDebug("connectivity-failed", {
      error: connectivity.error,
      latencyMs: connectivity.latencyMs,
    });
    return unavailableAuthState();
  }

  authDebug("connectivity-ok", { latencyMs: connectivity.latencyMs });
  return null;
}

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin) {
    return origin;
  }

  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";

  if (host) {
    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

function resolveRedirectPath(
  role: "client" | "admin" | "super_admin",
  redirectTo: string | null,
): string {
  const destination = isSafeRedirectPath(redirectTo)
    ? redirectTo
    : getRedirectPathForRole(role);

  authProfileTrace("resolveRedirectPath", {
    role,
    redirectTo,
    destination,
  });

  return destination;
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || null;

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  const preflight = await preflightAuth();
  if (preflight) {
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return envErrorState();
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      authDebug("login-auth-error", {
        message: error.message,
        code: error.code,
      });
      return { error: humanizeAuthError(error), message: null };
    }

    if (!data.user) {
      return { error: "Authentication failed. Please try again.", message: null };
    }

    authDebug("login-auth-ok", { userId: data.user.id });

    const profile = await ensureProfileForUser(data.user, supabase);
    if (!profile) {
      await supabase.auth.signOut();
      authProfileTrace(
        "login:profile-missing-after-auth",
        { userId: data.user.id, email: data.user.email ?? null },
        "error",
      );
      authDebug("login-profile-missing", { userId: data.user.id });
      return {
        error: getAuthErrorMessage(AUTH_ERROR_CODES.profile),
        message: null,
      };
    }

    const destination = resolveRedirectPath(profile.role, redirectTo);

    authDebug("login-redirect", {
      userId: data.user.id,
      profileId: profile.id,
      role: profile.role,
      destination,
    });

    redirect(destination);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      authDebug("login-network-error", {
        error: error instanceof Error ? error.message : String(error),
      });
      return unavailableAuthState();
    }
    throw error;
  }
}

export async function signup(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return {
      error: "Full name, email, and password are required.",
      message: null,
    };
  }

  if (password.length < 8) {
    return {
      error: "Password must be at least 8 characters.",
      message: null,
    };
  }

  const preflight = await preflightAuth();
  if (preflight) {
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return envErrorState();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      return { error: humanizeAuthError(error), message: null };
    }

    if (!data.user) {
      return { error: "Unable to create account. Try again.", message: null };
    }

    if (!data.session) {
      return {
        error: null,
        message:
          "Account created. Check your email to confirm your address, then sign in.",
      };
    }

    const profile = await ensureProfileForUser(data.user, supabase);
    const role = profile?.role ?? "client";
    const destination = getRedirectPathForRole(role);

    authDebug("signup-redirect", {
      userId: data.user.id,
      profileId: profile?.id ?? null,
      role,
      destination,
    });

    redirect(destination);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return unavailableAuthState();
    }
    throw error;
  }
}

export async function forgotPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required.", message: null };
  }

  const preflight = await preflightAuth();
  if (preflight) {
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return envErrorState();
    }

    const origin = await getOrigin();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/callback?next=/login`,
    });

    if (error) {
      return { error: humanizeAuthError(error), message: null };
    }

    return {
      error: null,
      message:
        "If an account exists for that email, a password reset link has been sent.",
    };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return unavailableAuthState();
    }
    throw error;
  }
}

export async function repairAccount(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || null;

  const preflight = await preflightAuth();
  if (preflight) {
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return envErrorState();
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { error: humanizeAuthError(error), message: null };
    }

    if (!user) {
      return {
        error: getAuthErrorMessage(AUTH_ERROR_CODES.auth),
        message: null,
      };
    }

    const profile = await ensureProfileForUser(user, supabase);
    if (!profile) {
      return {
        error: profileLoadErrorMessage("Profile record not found."),
        message: null,
      };
    }

    const destination = resolveRedirectPath(profile.role, redirectTo);

    authDebug("repair-redirect", {
      userId: user.id,
      profileId: profile.id,
      role: profile.role,
      destination,
    });

    redirect(destination);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return unavailableAuthState();
    }
    throw error;
  }
}

export async function logout() {
  const supabase = await createClientOptional();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/login");
}

export type CallbackExchangeResult =
  | { ok: true; redirectTo: string }
  | { ok: false; error: string };

/**
 * Exchange a PKCE auth code using server cookies (password reset / OAuth).
 * Browser clients cannot read the code verifier stored during server actions.
 */
export async function exchangeCallbackCode(
  code: string,
  next: string | null,
): Promise<CallbackExchangeResult> {
  const trimmed = code.trim();
  if (!trimmed) {
    return { ok: false, error: AUTH_ERROR_CODES.auth };
  }

  const preflight = await preflightAuth();
  if (preflight) {
    return { ok: false, error: AUTH_ERROR_CODES.unavailable };
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return { ok: false, error: AUTH_ERROR_CODES.unavailable };
    }

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(trimmed);

    if (exchangeError) {
      authDebug("callback-code-exchange-failed", {
        message: exchangeError.message,
        code: exchangeError.code,
      });
      return { ok: false, error: AUTH_ERROR_CODES.auth };
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { ok: false, error: AUTH_ERROR_CODES.auth };
    }

    const profile = await ensureProfileForUser(user, supabase);
    if (!profile) {
      return { ok: false, error: AUTH_ERROR_CODES.profile };
    }

    const redirectTo = resolveRedirectPath(profile.role, next);
    authDebug("callback-code-exchange-ok", {
      userId: user.id,
      profileId: profile.id,
      role: profile.role,
      redirectTo,
    });

    return { ok: true, redirectTo };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return { ok: false, error: AUTH_ERROR_CODES.unavailable };
    }
    authDebug("callback-code-exchange-exception", {
      error: error instanceof Error ? error.message : String(error),
    });
    return { ok: false, error: AUTH_ERROR_CODES.auth };
  }
}
