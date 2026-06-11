import { NextResponse } from "next/server";

import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import {
  DEV_AUTO_LOGIN,
  isDevAutoLoginEnabled,
} from "@/lib/auth/dev-credentials";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { getRedirectPathForRole } from "@/lib/auth/paths";
import { authDebug } from "@/lib/auth/profile";
import { createClientOptional } from "@/lib/supabase/server";

export async function GET(request: Request) {
  if (!isDevAutoLoginEnabled()) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClientOptional();
  if (!supabase) {
    return NextResponse.redirect(
      new URL(`/login?error=${AUTH_ERROR_CODES.unavailable}`, request.url),
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEV_AUTO_LOGIN.email,
    password: DEV_AUTO_LOGIN.password,
  });

  if (error || !data.user) {
    authDebug("dev-auto-login-failed", {
      message: error?.message ?? "no user",
      code: error?.code ?? null,
    });
    return NextResponse.redirect(
      new URL(`/login?error=${AUTH_ERROR_CODES.auth}`, request.url),
    );
  }

  const profile = await ensureProfileForUser(data.user, supabase);
  if (!profile) {
    return NextResponse.redirect(
      new URL(`/login?error=${AUTH_ERROR_CODES.profile}`, request.url),
    );
  }

  const destination = getRedirectPathForRole(profile.role);
  authDebug("dev-auto-login-ok", {
    userId: data.user.id,
    profileId: profile.id,
    role: profile.role,
    destination,
  });

  return NextResponse.redirect(new URL(destination, request.url));
}
