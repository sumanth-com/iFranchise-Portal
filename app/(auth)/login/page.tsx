import { redirect } from "next/navigation";

import { AuthExperience } from "@/components/auth/auth-experience";
import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
  isBlockingAuthError,
} from "@/lib/auth/auth-errors";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import { authDebug } from "@/lib/auth/profile";
import { getProfileByUserId, getUser } from "@/lib/auth/session";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    role?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo;
  const envStatus = getSupabaseEnvStatus();

  let authErrorCode = params.error ?? null;
  let pageError = getAuthErrorMessage(authErrorCode);

  if (!envStatus.configured) {
    return (
      <AuthExperience
        initialTab="login"
        initialRole={params.role === "admin" ? "admin" : "client"}
        redirectTo={redirectTo}
        pageError={envStatus.issues[0] ?? "Authentication is not configured."}
        authErrorCode={AUTH_ERROR_CODES.unavailable}
        envConfigured={false}
      />
    );
  }

  const user = await getUser();
  let profile = user ? await getProfileByUserId(user.id) : null;

  if (user) {
    authDebug("login-page-session", {
      userId: user.id,
      profileId: profile?.id ?? null,
      role: profile?.role ?? null,
      urlError: authErrorCode,
    });

    if (!profile) {
      const repaired = await ensureProfileForUser(user);
      if (repaired) {
        profile = repaired;
        authDebug("login-page-auto-repair", {
          userId: user.id,
          profileId: repaired.id,
          role: repaired.role,
        });
      }
    }

    if (!profile && !authErrorCode) {
      authErrorCode = AUTH_ERROR_CODES.profile;
      pageError = getAuthErrorMessage(AUTH_ERROR_CODES.profile);
    }

    // Stale ?error=unavailable from a transient middleware timeout — if the
    // session and profile load successfully now, send the user to the app.
    const staleUnavailable =
      authErrorCode === AUTH_ERROR_CODES.unavailable && profile;

    if (
      profile &&
      (!authErrorCode ||
        staleUnavailable ||
        !isBlockingAuthError(authErrorCode))
    ) {
      const destination = isSafeRedirectPath(redirectTo)
        ? redirectTo
        : getRedirectPathForRole(profile.role);
      redirect(destination);
    }
  }

  const initialRole = params.role === "admin" ? "admin" : "client";

  return (
    <AuthExperience
      initialTab="login"
      initialRole={initialRole}
      redirectTo={redirectTo}
      pageError={pageError}
      authErrorCode={authErrorCode}
      envConfigured
      hasSession={Boolean(user)}
      hasProfile={Boolean(profile)}
    />
  );
}
