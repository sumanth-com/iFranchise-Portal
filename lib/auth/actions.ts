"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { buildPasswordResetRedirectUrl } from "@/lib/auth/recovery";
import { validatePasswordPolicy } from "@/lib/auth/password-policy";
import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import {
  AUTH_ERROR_CODES,
} from "@/lib/auth/auth-errors";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { touchLastLogin } from "@/lib/auth/touch-last-login";
import {
  humanizeAuthError,
  unavailableAuthState,
} from "@/lib/auth/humanize-error";
import { logAuthEvent } from "@/lib/auth/auth-events";
import { authDebug, authProfileTrace } from "@/lib/auth/profile";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import { verifySupabaseConnectivity } from "@/lib/supabase/connectivity";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";
import { createClientOptional } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

function envErrorState(): AuthActionState {
  return {
    error: "Authentication is not configured. Contact support.",
    message: null,
  };
}

function preflightEnv(): AuthActionState | null {
  const envStatus = getSupabaseEnvStatus();
  if (!envStatus.configured) {
    return envErrorState();
  }
  return null;
}

async function preflightAuth(options?: {
  requireConnectivity?: boolean;
}): Promise<AuthActionState | null> {
  const envBlock = preflightEnv();
  if (envBlock) {
    return envBlock;
  }

  if (options?.requireConnectivity === false) {
    return null;
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

  logAuthEvent("auth.login.attempt", { email });

  const preflight = await preflightAuth({ requireConnectivity: false });
  if (preflight) {
    logAuthEvent("auth.login.failure", {
      email,
      reason: "env_not_configured",
    });
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      logAuthEvent("auth.login.failure", {
        email,
        reason: "client_unavailable",
      });
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
      logAuthEvent("auth.login.failure", {
        email,
        code: error.code ?? null,
        reason: "invalid_credentials",
      });
      return { error: humanizeAuthError(error), message: null };
    }

    if (!data.user) {
      logAuthEvent("auth.login.failure", {
        email,
        reason: "no_user",
      });
      return { error: "Please sign in to continue.", message: null };
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
      logAuthEvent("auth.login.failure", {
        email,
        userId: data.user.id,
        reason: "profile_missing",
      });
      return {
        error: "Please sign in to continue.",
        message: null,
      };
    }

    const destination = resolveRedirectPath(profile.role, redirectTo);

    if (profile.role === "admin" || profile.role === "super_admin") {
      await touchLastLogin(data.user.id, supabase);
    }

    logAuthEvent("auth.login.success", {
      email,
      userId: data.user.id,
      role: profile.role,
    });

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
      logAuthEvent("auth.login.failure", {
        email,
        reason: "service_unavailable",
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

  logAuthEvent("auth.signup.attempt", { email });

  const preflight = await preflightAuth();
  if (preflight) {
    logAuthEvent("auth.signup.failure", {
      email,
      reason: "preflight_failed",
    });
    return preflight;
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      logAuthEvent("auth.signup.failure", {
        email,
        reason: "client_unavailable",
      });
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
      logAuthEvent("auth.signup.failure", {
        email,
        code: error.code ?? null,
        reason: "signup_error",
      });
      return { error: humanizeAuthError(error), message: null };
    }

    if (!data.user) {
      logAuthEvent("auth.signup.failure", {
        email,
        reason: "no_user",
      });
      return { error: "Unable to create account. Try again.", message: null };
    }

    if (!data.session) {
      logAuthEvent("auth.signup.success", {
        email,
        userId: data.user.id,
        reason: "email_confirmation_pending",
      });
      return {
        error: null,
        message:
          "Account created. Check your email to confirm your address, then sign in.",
      };
    }

    const profile = await ensureProfileForUser(data.user, supabase);
    const role = profile?.role ?? "client";
    const destination = getRedirectPathForRole(role);

    logAuthEvent("auth.signup.success", {
      email,
      userId: data.user.id,
      role,
    });

    authDebug("signup-redirect", {
      userId: data.user.id,
      profileId: profile?.id ?? null,
      role,
      destination,
    });

    redirect(destination);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      logAuthEvent("auth.signup.failure", {
        email,
        reason: "service_unavailable",
      });
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
      redirectTo: buildPasswordResetRedirectUrl(origin),
    });

    if (error) {
      logAuthEvent("auth.password_reset.failure", {
        email,
        code: error.code ?? null,
        reason: "reset_email_failed",
      });
      return { error: humanizeAuthError(error), message: null };
    }

    logAuthEvent("auth.password_reset.request", { email });

    return {
      error: null,
      message: "Password reset link sent. Please check your inbox.",
    };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      logAuthEvent("auth.password_reset.failure", {
        email,
        reason: "service_unavailable",
      });
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
        error: "Please sign in to continue.",
        message: null,
      };
    }

    const profile = await ensureProfileForUser(user, supabase);
    if (!profile) {
      return {
        error: "Please sign in to continue.",
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
  redirect("/api/auth/logout");
}

export type RecoveryExchangeResult =
  | { ok: true }
  | { ok: false; error: string };

/**
 * Exchange a PKCE recovery code and establish a session for password reset only.
 * Does not require profile or role redirects.
 */
export async function exchangeRecoveryCode(
  code: string,
): Promise<RecoveryExchangeResult> {
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
      authDebug("recovery-code-exchange-failed", {
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

    authDebug("recovery-code-exchange-ok", { userId: user.id });
    return { ok: true };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return { ok: false, error: AUTH_ERROR_CODES.unavailable };
    }
    return { ok: false, error: AUTH_ERROR_CODES.auth };
  }
}

export async function resetPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!password || !confirmPassword) {
    return { error: "Please enter and confirm your new password.", message: null };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match.", message: null };
  }

  const policyError = validatePasswordPolicy(password);
  if (policyError) {
    return { error: policyError, message: null };
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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        error: "This reset link has expired. Please request a new one.",
        message: null,
      };
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      authDebug("reset-password-update-failed", {
        message: updateError.message,
        code: updateError.code,
      });
      logAuthEvent("auth.password_reset.failure", {
        userId: user.id,
        code: updateError.code ?? null,
        reason: "update_failed",
      });
      return { error: humanizeAuthError(updateError), message: null };
    }

    await supabase.auth.signOut({ scope: "global" });

    authDebug("reset-password-success", { userId: user.id });
    logAuthEvent("auth.password_reset.success", { userId: user.id });

    return {
      error: null,
      message: "password_updated",
    };
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return unavailableAuthState();
    }
    throw error;
  }
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

    if (profile.role === "admin" || profile.role === "super_admin") {
      await touchLastLogin(user.id, supabase);
    }

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
