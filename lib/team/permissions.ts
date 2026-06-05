import type { TeamRole } from "@/types/team";

export type Permission =
  | "team.view"
  | "team.invite"
  | "team.edit_roles"
  | "team.disable"
  | "team.view_logs"
  | "brands.review"
  | "brands.approve"
  | "brands.view_all"
  | "content.manage"
  | "support.view";

const ROLE_PERMISSIONS: Record<TeamRole, Permission[]> = {
  super_admin: [
    "team.view",
    "team.invite",
    "team.edit_roles",
    "team.disable",
    "team.view_logs",
    "brands.review",
    "brands.approve",
    "brands.view_all",
    "content.manage",
    "support.view",
  ],
  admin: [
    "team.view",
    "team.invite",
    "team.edit_roles",
    "team.disable",
    "team.view_logs",
    "brands.review",
    "brands.approve",
    "brands.view_all",
    "content.manage",
    "support.view",
  ],
  reviewer: [
    "team.view_logs",
    "brands.review",
    "brands.approve",
    "brands.view_all",
  ],
  content_manager: ["team.view_logs", "brands.view_all", "content.manage"],
  support: ["team.view_logs", "brands.view_all", "support.view"],
};

export function hasPermission(
  teamRole: TeamRole | null | undefined,
  permission: Permission,
): boolean {
  if (!teamRole) return false;
  return ROLE_PERMISSIONS[teamRole].includes(permission);
}

export function canManageTeam(teamRole: TeamRole | null | undefined): boolean {
  return hasPermission(teamRole, "team.view");
}

export function canInviteTeam(teamRole: TeamRole | null | undefined): boolean {
  return hasPermission(teamRole, "team.invite");
}

export function canEditTeamRoles(
  teamRole: TeamRole | null | undefined,
): boolean {
  return hasPermission(teamRole, "team.edit_roles");
}

export function canDisableTeamMembers(
  teamRole: TeamRole | null | undefined,
): boolean {
  return hasPermission(teamRole, "team.disable");
}

export function canAssignRole(
  actorRole: TeamRole,
  targetRole: TeamRole,
): boolean {
  if (actorRole === "super_admin") return true;
  if (actorRole === "admin") {
    return targetRole !== "super_admin";
  }
  return false;
}

export function getAssignableRoles(actorRole: TeamRole): TeamRole[] {
  if (actorRole === "super_admin") {
    return [
      "super_admin",
      "admin",
      "reviewer",
      "content_manager",
      "support",
    ];
  }
  if (actorRole === "admin") {
    return ["admin", "reviewer", "content_manager", "support"];
  }
  return [];
}

export function getRoleDescription(role: TeamRole): string {
  const descriptions: Record<TeamRole, string> = {
    super_admin: "Full access including team and super admin assignment.",
    admin: "Manage team, review brands, and configure content.",
    reviewer: "Review and approve brand submissions.",
    content_manager: "Manage published content and brand assets.",
    support: "View brands and assist clients.",
  };
  return descriptions[role];
}
