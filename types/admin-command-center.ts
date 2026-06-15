import type { ActivityLog } from "@/types/team";

export type AdminDisplayRole =
  | "admin"
  | "super_admin"
  | "founder"
  | "cofounder";

export type AdminDirectoryStatus = "active" | "pending" | "suspended";

export type AdminDirectoryRow = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  portalRole: "admin" | "super_admin";
  teamRole: string | null;
  displayRole: AdminDisplayRole;
  displayRoleLabel: string;
  status: AdminDirectoryStatus;
  isInvitation: boolean;
  invitationId: string | null;
  is_active: boolean;
  created_at: string;
  lastSignInAt: string | null;
};

export type CommandCenterKpi = {
  value: number;
  changePercent: number;
};

export type AdminCommandCenterStats = {
  totalAdmins: CommandCenterKpi;
  activeAdmins: CommandCenterKpi;
  pendingInvitations: CommandCenterKpi;
  suspendedAdmins: CommandCenterKpi;
  activeSessions: number;
  failedLoginAttempts: number;
  lastSecurityEventAt: string | null;
  lastSecurityEventLabel: string | null;
};

export type PermissionGroupDisplay = {
  id: string;
  label: string;
  description: string;
  permissions: {
    key: string;
    label: string;
    enabled: boolean;
  }[];
};

export type AdminCommandCenterData = {
  stats: AdminCommandCenterStats;
  directory: AdminDirectoryRow[];
  logs: ActivityLog[];
  permissionMatrix: PermissionGroupDisplay[];
  error: string | null;
};
