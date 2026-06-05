import { redirect } from "next/navigation";

import { AuthExperience } from "@/components/auth/auth-experience";
import {
  AUTH_ERROR_CODES,
  getAuthErrorMessage,
} from "@/lib/auth/auth-errors";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import {
  getRedirectPathForRole,
  isSafeRedirectPath,
} from "@/lib/auth/paths";
import { getUser } from "@/lib/auth/session";

type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const redirectTo = params.redirectTo;
  const pageError = getAuthErrorMessage(params.error);

  // Auto-repair: signed-in user with a missing profile row.
  if (params.error === AUTH_ERROR_CODES.profile) {
    const user = await getUser();
    if (user) {
      const profile = await ensureProfileForUser(user);
      if (profile) {
        const destination = isSafeRedirectPath(redirectTo)
          ? redirectTo
          : getRedirectPathForRole(profile.role);
        redirect(destination);
      }
    }
  }

  return (
    <AuthExperience
      initialTab="login"
      redirectTo={redirectTo}
      pageError={pageError}
      authErrorCode={params.error ?? null}
    />
  );
}
