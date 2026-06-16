import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AuthExperience } from "@/components/auth/auth-experience";
import { resolveAuthState } from "@/lib/auth/auth-state";
import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import { isDevAutoLoginEnabled } from "@/lib/auth/dev-credentials";
import {
  AUTH_NOTICE_COOKIE,
  getAuthNoticeMessage,
  legacyErrorToNotice,
  type AuthNoticeKind,
} from "@/lib/auth/notice";
import { authDebug } from "@/lib/auth/profile";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";
import { createClientOptional } from "@/lib/supabase/server";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
    logged_out?: string;
    ended?: string;
    signin?: string;
  }>;
};

async function readNotice(): Promise<AuthNoticeKind | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(AUTH_NOTICE_COOKIE)?.value;
  if (
    value === "session_ended" ||
    value === "sign_in_required" ||
    value === "signed_out"
  ) {
    return value;
  }
  return null;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo;
  const envStatus = getSupabaseEnvStatus();

  if (isDevAutoLoginEnabled()) {
    redirect("/dev-login");
  }

  const cookieNotice = await readNotice();
  const legacyNotice = legacyErrorToNotice(params.error);
  const urlNotice: AuthNoticeKind | null =
    params.ended === "1"
      ? "session_ended"
      : params.signin === "1"
        ? "sign_in_required"
        : params.logged_out === "1"
          ? "signed_out"
          : null;

  const notice = cookieNotice ?? legacyNotice ?? urlNotice;
  let noticeMessage = getAuthNoticeMessage(notice);

  if (!noticeMessage && params.error === AUTH_ERROR_CODES.unavailable) {
    noticeMessage = getAuthErrorMessage(AUTH_ERROR_CODES.unavailable);
  }

  // Clear stale session cookies when session has ended.
  if (notice === "session_ended" || params.error === AUTH_ERROR_CODES.expired) {
    const supabase = await createClientOptional();
    if (supabase) {
      await supabase.auth.signOut({ scope: "global" });
    }
  }

  if (!envStatus.configured) {
    return (
      <AuthExperience
        initialTab="login"
        redirectTo={redirectTo}
        noticeMessage={envStatus.issues[0] ?? "Authentication is not configured."}
        envConfigured={false}
      />
    );
  }

  const authState = await resolveAuthState({ repairProfile: true });

  authDebug("login-page-auth-state", {
    status: authState.status,
    userId: authState.user?.id ?? null,
    profileId: authState.profile?.id ?? null,
    role: authState.role,
    notice,
  });

  if (authState.status === "authenticated" && authState.profile) {
    const destination = isSafeRedirectPath(redirectTo)
      ? redirectTo
      : getRedirectPathForRole(authState.profile.role);

    redirect(destination);
  }

  return (
    <AuthExperience
      initialTab="login"
      redirectTo={redirectTo}
      noticeMessage={
        noticeMessage ??
        (authState.status === "authenticated" && !authState.profile
          ? "Please sign in to continue."
          : null)
      }
      envConfigured
      isRetrying={authState.status === "unavailable"}
    />
  );
}
