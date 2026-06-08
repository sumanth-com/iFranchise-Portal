"use client";

import { Activity } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalEmptyState } from "@/components/dashboard/client/portal-empty-state";
import { formatFriendlyTimestamp } from "@/lib/format-date";
import type { DashboardActivity } from "@/lib/dashboard/activity-feed";

type ActivityFeedProps = {
  activities: DashboardActivity[];
};

export function DashboardActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <GlassCard padding="lg" className="h-full">
      <h2 className="text-base font-semibold text-slate-900">Recent Activity</h2>
      <p className="mt-0.5 text-sm text-slate-500">
        Latest updates across your portfolio
      </p>

      {activities.length === 0 ? (
        <PortalEmptyState
          icon={Activity}
          title="No activity yet"
          description="Submit a brand to start tracking your review journey."
          className="py-10"
        />
      ) : (
        <ul className="mt-5 divide-y divide-slate-100">
          {activities.map((item) => (
            <li key={item.id} className="flex gap-3 py-3.5 first:pt-0 last:pb-0">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6D28D9]" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{item.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.description}</p>
                <p className="mt-1 text-[11px] font-medium text-slate-400">
                  {formatFriendlyTimestamp(item.timestamp)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  );
}
