import type { Profile, UserRole } from "@/types/auth";

/** Portal roles that access /admin */
export function isStaffRole(role: UserRole): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdminProfile(profile: Profile): boolean {
  if (!profile.is_active) return false;
  if (profile.role === "super_admin") return true;
  return profile.role === "admin" && profile.team_role === "super_admin";
}

export function isAdminProfile(profile: Profile): boolean {
  return profile.role === "admin" && profile.is_active;
}
