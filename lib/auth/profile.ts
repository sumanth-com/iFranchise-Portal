import type { Profile, UserRole } from "@/types/auth";
import type { TeamRole } from "@/types/team";

/** Columns guaranteed by migration 001 — safe on all environments. */
export const PROFILE_CORE_FIELDS =
  "id, email, full_name, role, created_at, updated_at" as const;

/** Extended columns from migration 004 (team management). */
export const PROFILE_TEAM_FIELDS = "team_role, is_active" as const;

export const PROFILE_FULL_FIELDS =
  `${PROFILE_CORE_FIELDS}, ${PROFILE_TEAM_FIELDS}` as const;

type ProfileRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
  team_role?: TeamRole | null;
  is_active?: boolean | null;
};

/** Fill team defaults when migration 004 columns are absent or null. */
export function normalizeProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email,
    full_name: row.full_name,
    role: row.role,
    created_at: row.created_at,
    updated_at: row.updated_at,
    team_role: row.team_role ?? null,
    is_active: row.is_active ?? true,
  };
}

type StaffGate = {
  role: UserRole;
  team_role: TeamRole | null;
  is_active: boolean;
};

/**
 * Staff-only gate: only applies when team_role is set (migration 004).
 * Legacy admins with role=admin and team_role=null remain valid.
 */
export function isDisabledStaffGate(gate: StaffGate): boolean {
  if (gate.role !== "admin" && gate.role !== "super_admin") {
    return false;
  }
  return !gate.is_active;
}

export function isDisabledStaffProfile(profile: Profile): boolean {
  return isDisabledStaffGate(profile);
}

export function authDebug(
  step: string,
  payload: Record<string, unknown>,
): void {
  if (process.env.NODE_ENV !== "development") {
    return;
  }
  console.log(`[auth:${step}]`, payload);
}
