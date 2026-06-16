/** Canonical bootstrap Super Admin email — not a secret; password is never stored in code. */
export const BOOTSTRAP_SUPER_ADMIN_EMAIL = "sumanth.reddy@ifranchise.in";

export const BOOTSTRAP_AUDIT_ACTIONS = {
  profileRecreated: "bootstrap.super_admin.profile_recreated",
  roleRestored: "bootstrap.super_admin.role_restored",
  repaired: "bootstrap.super_admin.repaired",
} as const;

export type BootstrapAuditAction =
  (typeof BOOTSTRAP_AUDIT_ACTIONS)[keyof typeof BOOTSTRAP_AUDIT_ACTIONS];

export type BootstrapRpcAction =
  | "profile_recreated"
  | "role_restored"
  | "permissions_initialized";

export type BootstrapHealthStatus =
  | "healthy"
  | "needs_repair"
  | "profile_missing"
  | "auth_user_missing"
  | "unavailable";

export type BootstrapHealth = {
  healthy: boolean;
  status: BootstrapHealthStatus;
  email: string;
  profileId?: string;
  role?: string;
  teamRole?: string | null;
  isActive?: boolean;
  authUserFound: boolean;
  checkedAt: string;
};

export type BootstrapRunResult = {
  ok: boolean;
  skipped?: boolean;
  reason?: string;
  email: string;
  profileId?: string;
  actions: BootstrapRpcAction[];
  health?: BootstrapHealth;
  source: string;
};
