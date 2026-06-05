import { cache } from "react";
import { redirect } from "next/navigation";

import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { authDebug, isDisabledStaffProfile } from "@/lib/auth/profile";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { createClientOptional } from "@/lib/supabase/server";
import {
  getRedirectPathForRole,
  PROTECTED_PATHS,
} from "@/lib/auth/paths";
import {
  isServiceUnavailableError,
  resolveUserFromGetUser,
} from "@/lib/auth/resolve-auth";
import { canManageTeam } from "@/lib/team/permissions";
import type { Profile, UserRole } from "@/types/auth";
import type { TeamRole } from "@/types/team";

function redirectToLogin(error: string): never {
  redirect(`/login?error=${error}`);
}

/**
 * Cached per-request so layout + page don't each hit Supabase separately.
 */
export const getUser = cache(async () => {
  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      return null;
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const resolved = resolveUserFromGetUser(user, error);

    authDebug("get-user", {
      userId: resolved.user?.id ?? null,
      unavailable: resolved.unavailable,
      error: error?.message ?? null,
    });

    if (resolved.unavailable) {
      return null;
    }

    return resolved.user;
  } catch {
    return null;
  }
});

export const getProfileByUserId = cache(
  async (userId: string): Promise<Profile | null> => {
    try {
      const supabase = await createClientOptional();
      if (!supabase) {
        authDebug("profile-skip", { userId, reason: "no-client" });
        return null;
      }

      const { profile, error } = await fetchProfileByUserId(supabase, userId);
      if (!profile && error) {
        authDebug("profile-null", { userId, error });
      }
      return profile;
    } catch (error) {
      authDebug("profile-exception", {
        userId,
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  },
);

export const getProfile = cache(async (): Promise<Profile | null> => {
  const user = await getUser();
  if (!user) {
    return null;
  }

  return getProfileByUserId(user.id);
});

export async function requireUser() {
  const { url, publishableKey } = getSupabaseEnv();
  if (!url || !publishableKey) {
    redirectToLogin(AUTH_ERROR_CODES.unavailable);
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      redirectToLogin(AUTH_ERROR_CODES.unavailable);
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const resolved = resolveUserFromGetUser(user, error);
    if (resolved.unavailable) {
      redirectToLogin(AUTH_ERROR_CODES.unavailable);
    }

    if (!resolved.user) {
      redirectToLogin(AUTH_ERROR_CODES.auth);
    }

    authDebug("require-user", { userId: resolved.user.id });
    return resolved.user;
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      redirectToLogin(AUTH_ERROR_CODES.unavailable);
    }
    redirectToLogin(AUTH_ERROR_CODES.auth);
  }
}

export async function requireProfile() {
  const user = await requireUser();
  const profile = await getProfileByUserId(user.id);

  if (!profile) {
    authDebug("require-profile-failed", {
      userId: user.id,
      redirect: `/login?error=${AUTH_ERROR_CODES.profile}`,
    });
    redirectToLogin(AUTH_ERROR_CODES.profile);
  }

  authDebug("require-profile", {
    userId: user.id,
    profileId: profile.id,
    role: profile.role,
    redirect: getRedirectPathForRole(profile.role),
  });

  return profile;
}

export async function requireClient() {
  const profile = await requireProfile();
  if (profile.role !== "client") {
    redirect(PROTECTED_PATHS.admin);
  }
  return profile;
}

export async function requireAdmin() {
  const profile = await requireProfile();
  if (profile.role !== "admin") {
    redirect(PROTECTED_PATHS.client);
  }
  if (isDisabledStaffProfile(profile)) {
    redirectToLogin(AUTH_ERROR_CODES.disabled);
  }
  return profile;
}

export async function requireTeamAccess() {
  const profile = await requireAdmin();
  if (!canManageTeam(profile.team_role as TeamRole | null)) {
    redirect(PROTECTED_PATHS.admin);
  }
  return profile;
}

export { getRedirectPathForRole };

export function isAdminRole(role: UserRole): boolean {
  return role === "admin";
}

export function isStaffProfile(profile: Profile): boolean {
  return (
    profile.role === "admin" &&
    profile.is_active &&
    profile.team_role != null
  );
}
