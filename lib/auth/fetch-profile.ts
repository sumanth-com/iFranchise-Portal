import type { SupabaseClient } from "@supabase/supabase-js";

import {
  authDebug,
  authProfileTrace,
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
  authProfileTrace("fetchProfileByUserId:start", {
    userId,
    table: "public.profiles",
    columns: PROFILE_CORE_FIELDS,
  });

  const core = await supabase
    .from("profiles")
    .select(PROFILE_CORE_FIELDS)
    .eq("id", userId)
    .maybeSingle();

  if (core.error) {
    if (isServiceUnavailableError(core.error)) {
      authProfileTrace(
        "fetchProfileByUserId:core-network-error",
        {
          userId,
          message: core.error.message,
          code: core.error.code,
          details: core.error.details,
          hint: core.error.hint,
        },
        "error",
      );
      throw core.error;
    }

    authProfileTrace(
      "fetchProfileByUserId:core-query-failed",
      {
        userId,
        table: "public.profiles",
        message: core.error.message,
        code: core.error.code,
        details: core.error.details,
        hint: core.error.hint,
      },
      "error",
    );

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
    authProfileTrace(
      "fetchProfileByUserId:core-no-row",
      {
        userId,
        table: "public.profiles",
        message: "Profile record not found (query ok, zero rows — missing row or RLS hide)",
      },
      "error",
    );
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

  authProfileTrace("fetchProfileByUserId:ok", {
    userId,
    profileId: profile.id,
    role: profile.role,
    team_role: profile.team_role,
    is_active: profile.is_active,
  });

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
