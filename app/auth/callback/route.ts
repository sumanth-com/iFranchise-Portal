import { NextResponse } from "next/server";

import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import {
  isServiceUnavailableError,
  resolveUserFromGetUser,
} from "@/lib/auth/resolve-auth";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { createClientOptional } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=${AUTH_ERROR_CODES.auth}`);
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return NextResponse.redirect(
        `${origin}/login?error=${AUTH_ERROR_CODES.unavailable}`,
      );
    }

    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      return NextResponse.redirect(`${origin}/login?error=${AUTH_ERROR_CODES.auth}`);
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    const resolved = resolveUserFromGetUser(user, userError);
    if (resolved.unavailable) {
      return NextResponse.redirect(
        `${origin}/login?error=${AUTH_ERROR_CODES.unavailable}`,
      );
    }

    if (!resolved.user) {
      return NextResponse.redirect(`${origin}/login?error=${AUTH_ERROR_CODES.auth}`);
    }

    const profile = await ensureProfileForUser(resolved.user);
    if (!profile) {
      return NextResponse.redirect(
        `${origin}/login?error=${AUTH_ERROR_CODES.profile}`,
      );
    }

    const redirectPath = isSafeRedirectPath(next)
      ? next
      : getRedirectPathForRole(profile.role);

    return NextResponse.redirect(`${origin}${redirectPath}`);
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return NextResponse.redirect(
        `${origin}/login?error=${AUTH_ERROR_CODES.unavailable}`,
      );
    }
    return NextResponse.redirect(`${origin}/login?error=${AUTH_ERROR_CODES.auth}`);
  }
}
