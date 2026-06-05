"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDateTime } from "@/lib/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { ActivityLog } from "@/types/team";

const ACTION_LABELS: Record<string, string> = {
  "team.invite": "Invited team member",
  "team.role_updated": "Updated member role",
  "team.member_disabled": "Disabled team member",
  "team.member_enabled": "Re-enabled team member",
  "team.invitation_revoked": "Revoked invitation",
};

type ActivityLogListProps = {
  logs: ActivityLog[];
};

export function ActivityLogList({ logs }: ActivityLogListProps) {
  return (
    <Card padding="lg">
      <h3 className="text-base font-semibold text-foreground">Activity log</h3>
      <p className="mt-1 text-sm text-slate-500">
        Recent team and permission changes
      </p>

      {logs.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Activity}
            title="No activity yet"
            description="Team actions will appear here as they happen."
          />
        </div>
      ) : (
        <motion.ul
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-6 max-h-[420px] space-y-3 overflow-y-auto pr-1"
        >
          {logs.map((log) => (
            <motion.li
              key={log.id}
              variants={staggerItem}
              className="rounded-2xl border border-border bg-surface-muted/50 px-4 py-3"
            >
              <p className="text-sm font-medium text-foreground">
                {ACTION_LABELS[log.action] ?? log.action}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {log.actor_name ?? log.actor_email ?? "System"} ·{" "}
                {formatDateTime(log.created_at)}
              </p>
              {log.metadata?.email ? (
                <p className="mt-1 text-xs text-slate-400">
                  {String(log.metadata.email)}
                </p>
              ) : null}
            </motion.li>
          ))}
        </motion.ul>
      )}
    </Card>
  );
}
