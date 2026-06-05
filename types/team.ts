export type TeamRole =
  | "super_admin"
  | "admin"
  | "reviewer"
  | "content_manager"
  | "support";

export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";

export type TeamMember = {
  id: string;
  email: string;
  full_name: string | null;
  team_role: TeamRole;
  is_active: boolean;
  disabled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TeamInvitation = {
  id: string;
  email: string;
  team_role: TeamRole;
  status: InvitationStatus;
  expires_at: string;
  created_at: string;
  invited_by_name: string | null;
};

export type ActivityLog = {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_email: string | null;
  actor_name: string | null;
};

export type TeamActionState = {
  error: string | null;
  message: string | null;
};

export const initialTeamActionState: TeamActionState = {
  error: null,
  message: null,
};

export const TEAM_ROLES: TeamRole[] = [
  "super_admin",
  "admin",
  "reviewer",
  "content_manager",
  "support",
];

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  reviewer: "Reviewer",
  content_manager: "Content Manager",
  support: "Support",
};
