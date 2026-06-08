"use client";

import Link from "next/link";
import { ArrowRight, Bell } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { formatNotificationTimestamp } from "@/lib/format-date";
import type { PortalNotification } from "@/lib/notifications/types";

type NotificationsPreviewProps = {
  notifications: PortalNotification[];
  totalCount: number;
};

export function DashboardNotificationsPreview({
  notifications,
  totalCount,
}: NotificationsPreviewProps) {
  const preview = notifications.slice(0, 4);

  return (
    <GlassCard padding="lg" className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Notifications
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {totalCount} update{totalCount === 1 ? "" : "s"} across your brands
          </p>
        </div>
        {totalCount > 0 ? (
          <span className="shrink-0 rounded-full bg-[#6D28D9]/10 px-2.5 py-1 text-xs font-semibold text-[#6D28D9]">
            {totalCount}
          </span>
        ) : null}
      </div>

      {preview.length === 0 ? (
        <div className="mt-8 flex flex-col items-center py-6 text-center">
          <Bell className="h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-600">All caught up</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {preview.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-3 transition-colors hover:border-[#6D28D9]/15 hover:bg-[#F5F3FF]/40"
            >
              <p className="text-sm font-medium text-slate-900">{n.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">
                {n.description}
              </p>
              <p className="mt-1.5 text-[11px] text-slate-400">
                {formatNotificationTimestamp(n.time)}
              </p>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/dashboard/notifications"
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D28D9] transition-colors hover:text-[#5B21B6]"
      >
        View all
        <ArrowRight className="h-4 w-4" />
      </Link>
    </GlassCard>
  );
}
