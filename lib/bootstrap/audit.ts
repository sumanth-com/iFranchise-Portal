import { createServiceClient } from "@/lib/supabase/service";

import {
  BOOTSTRAP_AUDIT_ACTIONS,
  BOOTSTRAP_SUPER_ADMIN_EMAIL,
  type BootstrapAuditAction,
  type BootstrapRpcAction,
} from "./types";

type AuditParams = {
  profileId: string;
  action: BootstrapAuditAction;
  source: string;
  actorId?: string | null;
  metadata?: Record<string, unknown>;
};

export async function logBootstrapAudit(params: AuditParams): Promise<void> {
  const service = createServiceClient();
  if (!service) {
    return;
  }

  try {
    await service.from("activity_logs").insert({
      actor_id: params.actorId ?? params.profileId,
      action: params.action,
      entity_type: "profile",
      entity_id: params.profileId,
      metadata: {
        email: BOOTSTRAP_SUPER_ADMIN_EMAIL,
        source: params.source,
        ...params.metadata,
      },
    });
  } catch {
    // Audit must never block bootstrap.
  }
}

export async function logBootstrapActions(params: {
  profileId: string;
  actions: BootstrapRpcAction[];
  source: string;
  actorId?: string | null;
}): Promise<void> {
  const { profileId, actions, source, actorId } = params;

  if (actions.includes("profile_recreated")) {
    await logBootstrapAudit({
      profileId,
      action: BOOTSTRAP_AUDIT_ACTIONS.profileRecreated,
      source,
      actorId,
    });
  }

  if (actions.includes("role_restored")) {
    await logBootstrapAudit({
      profileId,
      action: BOOTSTRAP_AUDIT_ACTIONS.roleRestored,
      source,
      actorId,
    });
  }

  if (actions.length > 0) {
    await logBootstrapAudit({
      profileId,
      action: BOOTSTRAP_AUDIT_ACTIONS.repaired,
      source,
      actorId,
      metadata: { actions },
    });
  }
}
