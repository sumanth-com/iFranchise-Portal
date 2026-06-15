import type { AdminDisplayRole } from "@/types/admin-command-center";
import type { TeamRole } from "@/types/team";

const OWNER_ROLES: AdminDisplayRole[] = [
  "super_admin",
  "founder",
  "cofounder",
];

export const ADMIN_INVITE_ROLES: {
  value: AdminDisplayRole;
  label: string;
  description: string;
}[] = [
  {
    value: "admin",
    label: "Admin",
    description: "Team member — reviews brands, manages leads, day-to-day platform work.",
  },
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Platform owner — full control. Reserve for yourself only.",
  },
];

/** Reserved for future UI — same access tier as Super Admin, different title. */
export const ADMIN_OWNER_TITLE_ROLES: {
  value: AdminDisplayRole;
  label: string;
}[] = [
  { value: "founder", label: "Founder" },
  { value: "cofounder", label: "Co-founder" },
];

function displayRoleToTeamRole(role: AdminDisplayRole): TeamRole {
  if (OWNER_ROLES.includes(role)) {
    return "super_admin";
  }
  return "admin";
}

export function resolveDisplayRole(
  portalRole: "admin" | "super_admin",
  teamRole: string | null,
  storedAdminRole?: string | null,
): { displayRole: AdminDisplayRole; label: string } {
  if (storedAdminRole === "founder") {
    return { displayRole: "founder", label: "Founder" };
  }
  if (storedAdminRole === "cofounder") {
    return { displayRole: "cofounder", label: "Co-founder" };
  }
  if (portalRole === "super_admin" || teamRole === "super_admin") {
    return { displayRole: "super_admin", label: "Super Admin" };
  }
  return { displayRole: "admin", label: "Admin" };
}

export function adminRoleToTeamRole(role: AdminDisplayRole): TeamRole {
  return displayRoleToTeamRole(role);
}

export function adminRoleToPortalRole(
  role: AdminDisplayRole,
): "admin" | "super_admin" {
  return OWNER_ROLES.includes(role) ? "super_admin" : "admin";
}

export function isOwnerAdminRole(role: AdminDisplayRole): boolean {
  return OWNER_ROLES.includes(role);
}
