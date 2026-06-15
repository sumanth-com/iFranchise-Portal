import { createClient } from "@/lib/supabase/server";
import type { ActivityLog, TeamInvitation, TeamMember } from "@/types/team";

const MEMBER_FIELDS =
  "id, email, full_name, team_role, role, phone, department, is_active, disabled_at, created_at, updated_at, last_login_at";

export async function getStaffProfile(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, email, full_name, role, team_role, is_active")
    .eq("id", userId)
    .single();

  return data;
}

export async function getTeamMembers(): Promise<{
  members: TeamMember[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(MEMBER_FIELDS)
    .in("role", ["admin", "super_admin"])
    .not("team_role", "is", null)
    .order("created_at", { ascending: false });

  if (error) {
    return { members: [], error: "Unable to load team members." };
  }

  return { members: (data ?? []) as TeamMember[], error: null };
}

export async function getPendingInvitations(): Promise<{
  invitations: TeamInvitation[];
  error: string | null;
}> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("team_invitations")
    .select(
      "id, email, team_role, status, expires_at, created_at, invited_by, profiles!team_invitations_invited_by_fkey (full_name)",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return { invitations: [], error: "Unable to load invitations." };
  }

  const invitations = (data ?? []).map((row) => {
    const raw = row.profiles as
      | { full_name: string | null }
      | { full_name: string | null }[]
      | null;
    const profiles = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id,
      email: row.email,
      team_role: row.team_role,
      status: row.status,
      expires_at: row.expires_at,
      created_at: row.created_at,
      invited_by_name: profiles?.full_name ?? null,
    };
  }) as TeamInvitation[];

  return { invitations, error: null };
}

export async function getActivityLogs(limit = 50): Promise<{
  logs: ActivityLog[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_logs")
    .select(
      "id, action, entity_type, entity_id, metadata, created_at, profiles!activity_logs_actor_id_fkey (email, full_name)",
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return { logs: [], error: "Unable to load activity logs." };
  }

  const logs = (data ?? []).map((row) => {
    const raw = row.profiles as
      | { email: string; full_name: string | null }
      | { email: string; full_name: string | null }[]
      | null;
    const actor = Array.isArray(raw) ? raw[0] : raw;
    return {
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      metadata: (row.metadata ?? {}) as Record<string, unknown>,
      created_at: row.created_at,
      actor_email: actor?.email ?? null,
      actor_name: actor?.full_name ?? null,
    };
  }) as ActivityLog[];

  return { logs, error: null };
}
