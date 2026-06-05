import type { SupabaseClient } from "@supabase/supabase-js";

import {
  authDebug,
  normalizeProfile,
  PROFILE_CORE_FIELDS,
  PROFILE_TEAM_FIELDS,
} from "@/lib/auth/profile";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import type { Profile } from "@/types/auth";

type ProfileQueryResult = {
  profile: Profile | null;
  error: string | null;
  usedFields: string;
};

function isMissingTeamColumns(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("team_role") ||
    lower.includes("is_active") ||
    lower.includes("does not exist")
  );
}

/**
 * Load a profile by user id.
 * Queries core columns first (always present), then optionally enriches team fields.
 */
export async function fetchProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<ProfileQueryResult> {
  const core = await supabase
    .from("profiles")
    .select(PROFILE_CORE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (core.error) {
    if (isServiceUnavailableError(core.error)) {
      throw core.error;
    }

    authDebug("profile-load-failed", {
      userId,
      error: core.error.message,
      code: core.error.code,
      stage: "core",
    });

    return {
      profile: null,
      error: core.error.message,
      usedFields: PROFILE_CORE_FIELDS,
    };
  }

  if (!core.data) {
    authDebug("profile-load-missing", { userId });
    return {
      profile: null,
      error: "Profile record not found.",
      usedFields: PROFILE_CORE_FIELDS,
    };
  }

  let row = core.data;

  const team = await supabase
    .from("profiles")
    .select(PROFILE_TEAM_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (!team.error && team.data) {
    row = { ...row, ...team.data };
  } else if (team.error && !isMissingTeamColumns(team.error.message)) {
    authDebug("profile-team-fields-skipped", {
      userId,
      error: team.error.message,
    });
  }

  const profile = normalizeProfile(row);

  authDebug("profile-load", {
    userId,
    profileId: profile.id,
    role: profile.role,
    usedFields: PROFILE_CORE_FIELDS,
    ok: true,
  });

  return {
    profile,
    error: null,
    usedFields: PROFILE_CORE_FIELDS,
  };
}
