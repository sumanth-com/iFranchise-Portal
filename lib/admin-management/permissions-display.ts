import type { AdminDisplayRole } from "@/types/admin-command-center";
import type { TeamRole } from "@/types/team";

function displayRoleToTeamRole(role: AdminDisplayRole): TeamRole {
  switch (role) {
    case "super_admin":
      return "super_admin";
    case "senior_admin":
      return "admin";
    default:
      return "reviewer";
  }
}

export function resolveDisplayRole(
  portalRole: "admin" | "super_admin",
  teamRole: string | null,
): { displayRole: AdminDisplayRole; label: string } {
  if (portalRole === "super_admin" || teamRole === "super_admin") {
    return { displayRole: "super_admin", label: "Super Admin" };
  }
  if (teamRole === "admin") {
    return { displayRole: "senior_admin", label: "Senior Admin" };
  }
  return { displayRole: "admin", label: "Admin" };
}

export function adminRoleToTeamRole(role: AdminDisplayRole): TeamRole {
  return displayRoleToTeamRole(role);
}

export function adminRoleToPortalRole(
  role: AdminDisplayRole,
): "admin" | "super_admin" {
  return role === "super_admin" ? "super_admin" : "admin";
}
