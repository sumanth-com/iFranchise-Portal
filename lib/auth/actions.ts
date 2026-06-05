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
import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/types/auth";

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
  role: "client" | "admin",
  redirectTo: string | null,
): string {
  if (isSafeRedirectPath(redirectTo)) {
    return redirectTo;
  }
  return getRedirectPathForRole(role);
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  const profile = await ensureProfileForUser(data.user);
  if (!profile) {
    return {
      error: getAuthErrorMessage(AUTH_ERROR_CODES.profile),
      message: null,
    };
  }

  redirect(resolveRedirectPath(profile.role, redirectTo));
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

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message, message: null };
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

  const profile = await ensureProfileForUser(data.user);
  const role = profile?.role ?? "client";
  redirect(getRedirectPathForRole(role));
}

export async function forgotPassword(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email) {
    return { error: "Email is required.", message: null };
  }

  const supabase = await createClient();
  const origin = await getOrigin();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/login`,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  return {
    error: null,
    message:
      "If an account exists for that email, a password reset link has been sent.",
  };
}

export async function repairAccount(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const redirectTo = String(formData.get("redirectTo") ?? "").trim() || null;

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: getAuthErrorMessage(AUTH_ERROR_CODES.auth),
      message: null,
    };
  }

  const profile = await ensureProfileForUser(user);
  if (!profile) {
    return {
      error: getAuthErrorMessage(AUTH_ERROR_CODES.profile),
      message: null,
    };
  }

  redirect(resolveRedirectPath(profile.role, redirectTo));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
