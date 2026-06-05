import { cache } from "react";
import { redirect } from "next/navigation";

import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
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

const PROFILE_FIELDS =
  "id, email, full_name, role, team_role, is_active, created_at, updated_at";

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
        return null;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(PROFILE_FIELDS)
        .eq("id", userId)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return data as Profile;
    } catch {
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
    redirectToLogin(AUTH_ERROR_CODES.profile);
  }

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
  if (!profile.is_active || !profile.team_role) {
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
