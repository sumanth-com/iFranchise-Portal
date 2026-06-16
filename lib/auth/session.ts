import { cache } from "react";
import { redirect } from "next/navigation";

import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
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
import { isStaffRole, isSuperAdminProfile } from "@/lib/auth/staff";
import { canManageTeam } from "@/lib/team/permissions";
import type { Profile, UserRole } from "@/types/auth";
import type { TeamRole } from "@/types/team";

function redirectToLogin(notice: "sign_in_required" | "session_ended"): never {
  redirect(`/api/auth/redirect-login?notice=${notice}`);
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
    redirectToLogin("sign_in_required");
  }

  try {
    const supabase = await createClientOptional();
    if (!supabase) {
      redirectToLogin("sign_in_required");
    }

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    const resolved = resolveUserFromGetUser(user, error);
    if (resolved.unavailable) {
      redirectToLogin("sign_in_required");
    }

    if (!resolved.user) {
      redirectToLogin("session_ended");
    }

    authDebug("require-user", { userId: resolved.user.id });
    return resolved.user;
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      redirectToLogin("sign_in_required");
    }
    redirectToLogin("session_ended");
  }
}

export async function requireProfile() {
  const user = await requireUser();
  let profile = await getProfileByUserId(user.id);

  if (!profile) {
    profile = await ensureProfileForUser(user);
    if (profile) {
      authDebug("require-profile-repaired", {
        userId: user.id,
        profileId: profile.id,
      });
    }
  }

  if (!profile) {
    authDebug("require-profile-failed", { userId: user.id });
    redirectToLogin("sign_in_required");
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

/** Any staff member (admin or super_admin). */
export async function requireStaff() {
  const profile = await requireProfile();
  if (!isStaffRole(profile.role)) {
    redirect(PROTECTED_PATHS.client);
  }
  if (isDisabledStaffProfile(profile)) {
    redirectToLogin("sign_in_required");
  }
  return profile;
}

/** @deprecated Alias — use requireStaff */
export async function requireAdmin() {
  return requireStaff();
}

export async function requireSuperAdmin() {
  const profile = await requireStaff();
  if (!isSuperAdminProfile(profile)) {
    redirect("/admin/access-denied");
  }
  return profile;
}

export async function requireTeamAccess() {
  const profile = await requireStaff();
  if (!canManageTeam(profile.team_role as TeamRole | null, profile.role)) {
    redirect("/admin/access-denied");
  }
  return profile;
}

export { getRedirectPathForRole };

export function isAdminRole(role: UserRole): boolean {
  return isStaffRole(role);
}

export function isStaffProfile(profile: Profile): boolean {
  return isStaffRole(profile.role) && profile.is_active;
}
