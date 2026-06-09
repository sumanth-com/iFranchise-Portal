"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import { matchesStaffLogin } from "@/lib/auth/staff";
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
import { authDebug } from "@/lib/auth/profile";
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
  if (isSafeRedirectPath(redirectTo)) {
    return redirectTo;
  }
  return getRedirectPathForRole(role);
}

function parseExpectedRole(formData: FormData): "client" | "admin" | null {
  const raw = String(formData.get("expectedRole") ?? "").trim();
  if (raw === "client" || raw === "admin") {
    return raw;
  }
  return null;
}

function roleMismatchMessage(expected: "client" | "admin"): string {
  if (expected === "admin") {
    return "This account does not have admin access. Sign in as Brand Owner instead.";
  }
  return "This account is not a brand owner. Sign in as Admin instead.";
}

export async function login(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || null;
  const expectedRole = parseExpectedRole(formData);

  if (!email || !password) {
    return { error: "Email and password are required.", message: null };
  }

  if (!expectedRole) {
    return { error: "Please select Brand Owner or Admin.", message: null };
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

    authDebug("login-auth-ok", { userId: data.user.id, expectedRole });

    const profile = await ensureProfileForUser(data.user, supabase);
    if (!profile) {
      await supabase.auth.signOut();
      authDebug("login-profile-missing", { userId: data.user.id });
      return {
        error: getAuthErrorMessage(AUTH_ERROR_CODES.profile),
        message: null,
      };
    }

    if (!matchesStaffLogin(profile, expectedRole)) {
      await supabase.auth.signOut();
      authDebug("login-role-mismatch", {
        userId: data.user.id,
        expectedRole,
        actualRole: profile.role,
      });
      return { error: roleMismatchMessage(expectedRole), message: null };
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
  const expectedRole = parseExpectedRole(formData);

  if (expectedRole === "admin") {
    return {
      error: "Admin accounts are provisioned by the iFranchise team.",
      message: null,
    };
  }

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
