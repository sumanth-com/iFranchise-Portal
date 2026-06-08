"use client";

import { motion } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileWarning,
  MessageSquare,
  Rocket,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalEmptyState } from "@/components/dashboard/client/portal-empty-state";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import { formatNotificationTimestamp } from "@/lib/format-date";
import {
  deleteNotification,
  getDeletedNotificationIds,
  getReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/read-state";
import type {
  NotificationCategory,
  PortalNotification,
} from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

type NotificationsActivityProps = {
  userId: string;
  notifications: PortalNotification[];
};

const CATEGORY_ICONS: Record<NotificationCategory, LucideIcon> = {
  brand_submitted: Send,
  review_started: Clock,
  brand_approved: CheckCircle2,
  brand_rejected: XCircle,
  edit_window_expired: Clock,
  document_missing: FileWarning,
  marketplace_published: Rocket,
  admin_comment: MessageSquare,
  system_update: Bell,
};

export function NotificationsActivity({
  userId,
  notifications,
}: NotificationsActivityProps) {
  const [hydrated, setHydrated] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setReadIds(getReadNotificationIds(userId));
    setDeletedIds(getDeletedNotificationIds(userId));
    setHydrated(true);
  }, [userId]);

  const visible = useMemo(
    () => notifications.filter((n) => !deletedIds.has(n.id)),
    [notifications, deletedIds],
  );

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return visible.filter((n) => !readIds.has(n.id)).length;
  }, [hydrated, visible, readIds]);

  const handleMarkRead = useCallback(
    (id: string) => {
      markNotificationRead(userId, id);
      setReadIds((prev) => new Set([...prev, id]));
    },
    [userId],
  );

  const handleMarkAllRead = useCallback(() => {
    markAllNotificationsRead(
      userId,
      visible.map((n) => n.id),
    );
    setReadIds(new Set(visible.map((n) => n.id)));
  }, [userId, visible]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteNotification(userId, id);
      setDeletedIds((prev) => new Set([...prev, id]));
    },
    [userId],
  );

  return (
    <div className="portal-page space-y-6">
      <PortalPageHeader
        eyebrow="Activity Center"
        title="Notifications"
        description="Track submissions, reviews, and marketplace updates across your portfolio."
        action={
          hydrated && unreadCount > 0 ? (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-2 rounded-xl border border-[#6D28D9]/20 bg-[#6D28D9]/5 px-3 py-2 text-xs font-semibold text-[#6D28D9] transition-all duration-200 hover:bg-[#6D28D9]/10"
            >
              <CheckCheck className="h-4 w-4" />
              Mark all as read
            </button>
          ) : null
        }
      />

      <GlassCard padding="none" className="overflow-hidden">
        {visible.length === 0 ? (
          <PortalEmptyState
            icon={Bell}
            title="All caught up"
            description="New activity about your brands will appear here when something changes."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {visible.map((n) => {
              const isUnread = hydrated && !readIds.has(n.id);
              const Icon = CATEGORY_ICONS[n.category];
              return (
                <motion.li
                  key={n.id}
                  layout
                  className={cn(
                    "group px-4 py-5 transition-colors duration-200 sm:px-6",
                    isUnread
                      ? "border-l-[3px] border-l-[#6D28D9] bg-[#F5F3FF]/60"
                      : "border-l-[3px] border-l-transparent hover:bg-slate-50/80",
                  )}
                >
                  <div className="flex gap-4">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        isUnread
                          ? "bg-gradient-to-br from-[#6D28D9] to-[#5B21B6] text-white shadow-sm"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-slate-900">
                          {n.title}
                        </p>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                            isUnread
                              ? "bg-[#6D28D9]/15 text-[#6D28D9]"
                              : "bg-slate-100 text-slate-500",
                          )}
                        >
                          {isUnread ? "Unread" : "Read"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                        {n.description}
                      </p>
                      <p className="mt-2.5 text-xs font-medium text-slate-400">
                        {formatNotificationTimestamp(n.time)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {isUnread ? (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(n.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
                          >
                            <Check className="h-3.5 w-3.5" />
                            Mark as read
                          </button>
                        ) : null}
                        <Link
                          href={n.href}
                          onClick={() => handleMarkRead(n.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#6D28D9] transition-colors hover:bg-[#6D28D9]/10"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          View details
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 transition-opacity hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
