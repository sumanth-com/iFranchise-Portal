import { authDebug } from "@/lib/auth/profile";
import { createServiceClient } from "@/lib/supabase/service";

import { logBootstrapActions } from "./audit";
import {
  BOOTSTRAP_SUPER_ADMIN_EMAIL,
  type BootstrapHealth,
  type BootstrapHealthStatus,
  type BootstrapRpcAction,
  type BootstrapRunResult,
} from "./types";

type RpcHealthRow = {
  healthy?: boolean;
  status?: string;
  email?: string;
  profile_id?: string;
  role?: string;
  team_role?: string | null;
  is_active?: boolean;
  auth_user_found?: boolean;
};

type RpcBootstrapRow = {
  ok?: boolean;
  reason?: string;
  email?: string;
  profile_id?: string;
  actions?: BootstrapRpcAction[];
  profile_created?: boolean;
  role_restored?: boolean;
  permissions_initialized?: boolean;
  already_healthy?: boolean;
};

let startupBootstrapPromise: Promise<BootstrapRunResult> | null = null;

function mapHealth(row: RpcHealthRow | null, email: string): BootstrapHealth {
  const status = (row?.status ?? "unavailable") as BootstrapHealthStatus;

  return {
    healthy: Boolean(row?.healthy),
    status,
    email: row?.email ?? email,
    profileId: row?.profile_id,
    role: row?.role,
    teamRole: row?.team_role,
    isActive: row?.is_active,
    authUserFound: Boolean(row?.auth_user_found),
    checkedAt: new Date().toISOString(),
  };
}

function parseRpcActions(row: RpcBootstrapRow | null): BootstrapRpcAction[] {
  if (Array.isArray(row?.actions)) {
    return row.actions;
  }

  const actions: BootstrapRpcAction[] = [];
  if (row?.profile_created) actions.push("profile_recreated");
  if (row?.role_restored) actions.push("role_restored");
  if (row?.permissions_initialized) actions.push("permissions_initialized");
  return actions;
}

export async function getSuperAdminBootstrapHealth(
  email: string = BOOTSTRAP_SUPER_ADMIN_EMAIL,
): Promise<BootstrapHealth> {
  const service = createServiceClient();
  if (!service) {
    return {
      healthy: false,
      status: "unavailable",
      email,
      authUserFound: false,
      checkedAt: new Date().toISOString(),
    };
  }

  const { data, error } = await service.rpc("bootstrap_super_admin_health", {
    p_email: email,
  });

  if (error) {
    authDebug("bootstrap-health-error", { message: error.message });
    return {
      healthy: false,
      status: "unavailable",
      email,
      authUserFound: false,
      checkedAt: new Date().toISOString(),
    };
  }

  return mapHealth(data as RpcHealthRow, email);
}

export async function runSuperAdminBootstrap(options: {
  source: string;
  actorId?: string | null;
  email?: string;
}): Promise<BootstrapRunResult> {
  const email = options.email ?? BOOTSTRAP_SUPER_ADMIN_EMAIL;
  const service = createServiceClient();

  if (!service) {
    return {
      ok: false,
      skipped: true,
      reason: "service_role_unavailable",
      email,
      actions: [],
      source: options.source,
    };
  }

  const { data, error } = await service.rpc("bootstrap_super_admin_profile", {
    p_email: email,
  });

  const row = (data ?? null) as RpcBootstrapRow | null;

  if (error) {
    authDebug("bootstrap-run-error", {
      source: options.source,
      message: error.message,
    });

    return {
      ok: false,
      reason: error.message,
      email,
      actions: [],
      source: options.source,
      health: await getSuperAdminBootstrapHealth(email),
    };
  }

  const actions = parseRpcActions(row);
  const profileId = row?.profile_id;

  if (profileId && actions.length > 0) {
    await logBootstrapActions({
      profileId,
      actions,
      source: options.source,
      actorId: options.actorId,
    });
  }

  const health = await getSuperAdminBootstrapHealth(email);

  authDebug("bootstrap-run-complete", {
    source: options.source,
    ok: row?.ok,
    reason: row?.reason,
    actions,
    health: health.status,
  });

  return {
    ok: Boolean(row?.ok),
    reason: row?.reason,
    email,
    profileId,
    actions,
    health,
    source: options.source,
  };
}

/** Runs once per server process on startup — avoids duplicate concurrent bootstrap. */
export function runSuperAdminBootstrapOnStartup(): Promise<BootstrapRunResult> {
  if (!startupBootstrapPromise) {
    startupBootstrapPromise = runSuperAdminBootstrap({ source: "startup" });
  }
  return startupBootstrapPromise;
}
