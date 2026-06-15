import { createClient } from "@/lib/supabase/server";
import type { ActivityLog } from "@/types/team";

export type AdminAccount = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  department: string | null;
  role: "admin" | "super_admin";
  team_role: string | null;
  is_active: boolean;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
};

export type AdminInvitation = {
  id: string;
  email: string;
  team_role: string;
  status: string;
  expires_at: string;
  created_at: string;
};

export async function getAdminAccounts(): Promise<{
  admins: AdminAccount[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, full_name, phone, department, role, team_role, is_active, disabled_at, created_at, updated_at, last_login_at",
    )
    .in("role", ["admin", "super_admin"])
    .order("created_at", { ascending: false });

  if (error) {
    return { admins: [], error: "Unable to load admin accounts." };
  }

  return {
    admins: (data ?? []) as AdminAccount[],
    error: null,
  };
}

export async function getAdminInvitations(): Promise<{
  invitations: AdminInvitation[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("team_invitations")
    .select("id, email, team_role, status, expires_at, created_at")
    .in("team_role", ["reviewer", "admin", "super_admin"])
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    return { invitations: [], error: null };
  }

  return { invitations: (data ?? []) as AdminInvitation[], error: null };
}

export async function getAdminManagementActivity(): Promise<{
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
    .limit(50);

  if (error) {
    return { logs: [], error: null };
  }

  const logs = (data ?? []).map((row) => {
    const profiles = row.profiles as
      | { email: string; full_name: string | null }
      | { email: string; full_name: string | null }[]
      | null;
    const profile = Array.isArray(profiles) ? profiles[0] : profiles;
    return {
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      metadata: row.metadata as Record<string, unknown>,
      created_at: row.created_at,
      actor_email: profile?.email ?? null,
      actor_name: profile?.full_name ?? null,
    };
  });

  return { logs, error: null };
}

export async function getAdminPermissions(profileId: string): Promise<{
  permissions: { permission: string; enabled: boolean }[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_permissions")
    .select("permission, enabled")
    .eq("profile_id", profileId);

  if (error) {
    return { permissions: [], error: error.message };
  }

  return { permissions: data ?? [], error: null };
}
