import { getProfileByUserId } from "@/lib/auth/session";
import { createClientOptional } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { Profile } from "@/types/auth";

type EnsureProfileUser = {
  id: string;
  email?: string | null;
  user_metadata?: { full_name?: string } | null;
};

const PROFILE_SELECT =
  "id, email, full_name, role, team_role, is_active, created_at, updated_at";

async function createProfileViaService(
  user: EnsureProfileUser,
): Promise<Profile | null> {
  const service = createServiceClient();
  if (!service) {
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
    .select(PROFILE_SELECT)
    .single();

  if (error || !data) {
    return null;
  }

  return data as Profile;
}

async function createProfileViaRpc(): Promise<Profile | null> {
  const supabase = await createClientOptional();
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.rpc("ensure_own_profile");
  if (error || !data) {
    return null;
  }

  return data as Profile;
}

/**
 * Returns an existing profile or creates one for the authenticated user.
 * Handles OAuth users and accounts created before the signup trigger existed.
 */
export async function ensureProfileForUser(
  user: EnsureProfileUser,
): Promise<Profile | null> {
  const existing = await getProfileByUserId(user.id);
  if (existing) {
    return existing;
  }

  const viaService = await createProfileViaService(user);
  if (viaService) {
    return viaService;
  }

  return createProfileViaRpc();
}
