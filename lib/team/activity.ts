import { createClient } from "@/lib/supabase/server";

export async function logActivity(params: {
  actorId: string;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const supabase = await createClient();
  await supabase.from("activity_logs").insert({
    actor_id: params.actorId,
    action: params.action,
    entity_type: params.entityType ?? null,
    entity_id: params.entityId ?? null,
    metadata: params.metadata ?? {},
  });
}
