import type { SupabaseClient } from "@supabase/supabase-js";

import { fetchProfileByUserId } from "@/lib/auth/fetch-profile";
import { authDebug, authProfileTrace, PROFILE_CORE_FIELDS } from "@/lib/auth/profile";
import { isServiceUnavailableError } from "@/lib/auth/resolve-auth";
import { createClientOptional } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Profile } from "@/types/auth";

type EnsureProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string } | null;
};

async function createProfileViaService(
  user: EnsureProfileUser,
): Promise<Profile | null> {
  const service = createServiceClient();
  if (!service) {
    authDebug("ensure-profile-service-missing", { userId: user.id });
    return null;
  }

  let email = user.email ?? "";
  let fullName =
    typeof user.user_metadata?.full_name === "string"
      ? user.user_metadata.full_name.trim()
      : null;

  if (!email) {
    const { data: authData } = await service.auth.admin.getUserById(user.id);
    email = authData.user?.email ?? "";
    if (!fullName && authData.user?.user_metadata?.full_name) {
      const meta = String(authData.user.user_metadata.full_name).trim();
      fullName = meta || null;
    }
  }

  const { data, error } = await service
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email,
        full_name: fullName,
        role: "client",
      },
      { onConflict: "id" },
    )
    .select(PROFILE_CORE_FIELDS)
    .single();

  if (error || !data) {
    authProfileTrace(
      "ensureProfileForUser:service-upsert-failed",
      {
        userId: user.id,
        table: "public.profiles",
        message: error?.message ?? "no data",
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
      },
      "error",
    );
    authDebug("ensure-profile-service-failed", {
      userId: user.id,
      error: error?.message ?? "no data",
    });
    return null;
  }

  authDebug("ensure-profile-created-service", { userId: user.id });

  return {
    ...data,
    team_role: null,
    is_active: true,
  } as Profile;
}

async function createProfileViaRpc(
  supabase: SupabaseClient,
): Promise<Profile | null> {
  const { data, error } = await supabase.rpc("ensure_own_profile");

  if (error || !data) {
    authProfileTrace(
      "ensureProfileForUser:rpc-failed",
      {
        rpc: "ensure_own_profile",
        message: error?.message ?? "no data",
        code: error?.code ?? null,
        details: error?.details ?? null,
        hint: error?.hint ?? null,
      },
      "error",
    );
    authDebug("ensure-profile-rpc-failed", {
      error: error?.message ?? "no data",
      code: error?.code,
    });
    return null;
  }

  authDebug("ensure-profile-created-rpc", { userId: data.id });

  return {
    ...data,
    team_role: data.team_role ?? null,
    is_active: data.is_active ?? true,
  } as Profile;
}

/**
 * Returns an existing profile or creates one for the authenticated user.
 * Pass the same Supabase client used for sign-in so the session is available for RLS.
 */
export async function ensureProfileForUser(
  user: EnsureProfileUser,
  supabaseClient?: SupabaseClient,
): Promise<Profile | null> {
  authProfileTrace("ensureProfileForUser:start", {
    userId: user.id,
    email: user.email ?? null,
  });

  const supabase = supabaseClient ?? (await createClientOptional());
  if (!supabase) {
    authProfileTrace(
      "ensureProfileForUser:no-client",
      { userId: user.id },
      "error",
    );
    authDebug("ensure-profile-no-client", { userId: user.id });
    return null;
  }

  try {
    const existing = await fetchProfileByUserId(supabase, user.id);
    if (existing.profile) {
      authProfileTrace("ensureProfileForUser:existing", {
        userId: user.id,
        profileId: existing.profile.id,
        role: existing.profile.role,
      });
      return existing.profile;
    }

    authProfileTrace("ensureProfileForUser:repair-needed", {
      userId: user.id,
      fetchError: existing.error,
    });
    authDebug("ensure-profile-repair", {
      userId: user.id,
      reason: existing.error,
    });
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      throw error;
    }
    authProfileTrace(
      "ensureProfileForUser:fetch-exception",
      {
        userId: user.id,
        message: error instanceof Error ? error.message : String(error),
      },
      "error",
    );
    authDebug("ensure-profile-load-exception", {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const viaService = await createProfileViaService(user);
  if (viaService) {
    authProfileTrace("ensureProfileForUser:created-via-service", {
      userId: user.id,
      profileId: viaService.id,
      role: viaService.role,
    });
    return viaService;
  }

  const viaRpc = await createProfileViaRpc(supabase);
  if (viaRpc) {
    authProfileTrace("ensureProfileForUser:created-via-rpc", {
      userId: user.id,
      profileId: viaRpc.id,
      role: viaRpc.role,
    });
    return viaRpc;
  }

  authProfileTrace(
    "ensureProfileForUser:failed-all-paths",
    { userId: user.id },
    "error",
  );
  return null;
}
