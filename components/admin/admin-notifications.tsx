"use client";

import Link from "next/link";
import {
  Bell,
  Building2,
  RefreshCw,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatNotificationTimestamp } from "@/lib/format-date";
import {
  ADMIN_NOTIFICATION_CATEGORY_LABELS,
  type AdminNotification,
  type AdminNotificationCategory,
} from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<AdminNotificationCategory, LucideIcon> = {
  new_submission: Send,
  resubmission: RefreshCw,
  owner_activity: Building2,
};

const CATEGORY_COLORS: Record<AdminNotificationCategory, string> = {
  new_submission: "bg-amber-100 text-amber-700",
  resubmission: "bg-blue-100 text-blue-700",
  owner_activity: "bg-slate-100 text-slate-600",
};

type AdminNotificationsProps = {
  notifications: AdminNotification[];
};

export function AdminNotifications({ notifications }: AdminNotificationsProps) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="No notifications"
        description="New submissions and brand owner activity will appear here."
      />
    );
  }

  return (
    <div className="space-y-4">
      {notifications.map((notification) => {
        const Icon = CATEGORY_ICONS[notification.category];
        return (
          <Card key={notification.id} padding="md" className="transition-shadow hover:shadow-[var(--shadow-md)]">
            <Link href={notification.href} className="flex gap-4">
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  CATEGORY_COLORS[notification.category],
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    {notification.title}
                  </p>
                  <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {ADMIN_NOTIFICATION_CATEGORY_LABELS[notification.category]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {notification.description}
                </p>
                <time className="mt-2 block text-xs text-slate-400">
                  {formatNotificationTimestamp(notification.time)}
                </time>
              </div>
            </Link>
          </Card>
        );
      })}
    </div>
  );
}
