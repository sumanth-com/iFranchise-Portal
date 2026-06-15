export const ADMIN_PERMISSION_KEYS = [
  "review_brands",
  "approve_brands",
  "manage_leads",
  "view_analytics",
  "manage_team",
  "send_messages",
] as const;

export type AdminPermissionKey = (typeof ADMIN_PERMISSION_KEYS)[number];

export const ADMIN_PERMISSION_LABELS: Record<AdminPermissionKey, string> = {
  review_brands: "Review Brands",
  approve_brands: "Approve Brands",
  manage_leads: "Manage Leads",
  view_analytics: "View Analytics",
  manage_team: "Manage Team",
  send_messages: "Send Messages",
};

export type AdminPermissionRow = {
  permission: AdminPermissionKey;
  enabled: boolean;
};

export function defaultPermissionsForTeamRole(
  teamRole: string,
): Record<AdminPermissionKey, boolean> {
  const isSuper = teamRole === "super_admin";
  return {
    review_brands: true,
    approve_brands: true,
    manage_leads: true,
    view_analytics: true,
    manage_team: isSuper,
    send_messages: true,
  };
}
