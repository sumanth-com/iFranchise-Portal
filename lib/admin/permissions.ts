import { isSuperAdminProfile } from "@/lib/auth/staff";
import { hasPermission } from "@/lib/team/permissions";
import type { Profile } from "@/types/auth";
import type { TeamRole } from "@/types/team";

export function getAdminTeamRole(profile: Profile): TeamRole | null {
  if (profile.role === "super_admin") return "super_admin";
  return (profile.team_role as TeamRole | null) ?? "admin";
}

function resolveEffectiveRole(profile: Profile): TeamRole {
  if (isSuperAdminProfile(profile)) return "super_admin";
  return (profile.team_role as TeamRole | null) ?? "admin";
}

export function canReviewBrands(profile: Profile): boolean {
  return hasPermission(resolveEffectiveRole(profile), "brands.review");
}

export function canApproveBrands(profile: Profile): boolean {
  return hasPermission(resolveEffectiveRole(profile), "brands.approve");
}

export function canPublishBrands(profile: Profile): boolean {
  return hasPermission(resolveEffectiveRole(profile), "brands.approve");
}

export function canViewAllBrands(profile: Profile): boolean {
  return hasPermission(resolveEffectiveRole(profile), "brands.view_all");
}

export function canManageAdminAccounts(profile: Profile): boolean {
  return isSuperAdminProfile(profile);
}
