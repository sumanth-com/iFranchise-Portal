"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  FileWarning,
  MessageSquare,
  Rocket,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
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
import { NOTIFICATION_CATEGORY_LABELS } from "@/lib/notifications/types";
import type {
  NotificationCategory,
  PortalNotification,
} from "@/lib/notifications/types";
import { useClientSettings } from "@/lib/settings/use-client-settings";
import type { SettingsPreferences } from "@/lib/settings/client-preferences";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const { prefs, ready: prefsReady } = useClientSettings(userId);

  useEffect(() => {
    setReadIds(getReadNotificationIds(userId));
    setDeletedIds(getDeletedNotificationIds(userId));
    setHydrated(true);
  }, [userId]);

  const visible = useMemo(() => {
    return notifications
      .filter((n) => !deletedIds.has(n.id))
      .filter((n) =>
        prefsReady ? matchesNotificationPrefs(n.category, prefs) : true,
      );
  }, [notifications, deletedIds, prefs, prefsReady]);

  const alertsPaused = prefsReady && !prefs.platformNotifications;

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return visible.filter((n) => !readIds.has(n.id)).length;
  }, [hydrated, visible, readIds]);

  const selected = useMemo(
    () => visible.find((n) => n.id === selectedId) ?? null,
    [visible, selectedId],
  );

  useEffect(() => {
    if (!hydrated || visible.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !visible.some((n) => n.id === selectedId)) {
      const firstUnread = visible.find((n) => !readIds.has(n.id));
      setSelectedId(firstUnread?.id ?? visible[0]?.id ?? null);
    }
  }, [hydrated, visible, selectedId, readIds]);

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
      setReadIds((prev) => new Set([...prev, id]));
      if (selectedId === id) {
        const remaining = visible.filter((n) => n.id !== id);
        setSelectedId(remaining[0]?.id ?? null);
        setMobileShowDetail(false);
      }
    },
    [userId, selectedId, visible],
  );

  const handleSelect = useCallback(
    (n: PortalNotification) => {
      setSelectedId(n.id);
      setMobileShowDetail(true);
      if (hydrated && !readIds.has(n.id)) {
        handleMarkRead(n.id);
      }
    },
    [hydrated, readIds, handleMarkRead],
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

      {alertsPaused ? (
        <GlassCard padding="lg">
          <PortalEmptyState
            icon={Bell}
            title="In-app notifications are off"
            description="Turn on in-app notifications in Settings → Preferences to see listing updates here."
            action={
              <Link
                href="/dashboard/settings"
                className="inline-flex h-10 items-center justify-center rounded-xl bg-[#6D28D9] px-4 text-sm font-semibold text-white hover:bg-[#5B21B6]"
              >
                Open Preferences
              </Link>
            }
          />
        </GlassCard>
      ) : visible.length === 0 ? (
        <GlassCard padding="lg">
          <PortalEmptyState
            icon={Bell}
            title="All caught up"
            description="Real updates about your brands will appear here when something changes."
          />
        </GlassCard>
      ) : (
        <GlassCard
          padding="none"
          className="overflow-hidden border border-slate-200/90"
        >
          <div className="flex min-h-[520px] flex-col lg:flex-row">
            {/* Inbox list */}
            <div
              className={cn(
                "w-full shrink-0 border-slate-200 lg:w-[min(380px,38%)] lg:border-r",
                mobileShowDetail ? "hidden lg:block" : "block",
              )}
            >
              <div className="border-b border-slate-100 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Inbox
                  {hydrated && unreadCount > 0 ? (
                    <span className="ml-2 rounded-full bg-[#6D28D9] px-2 py-0.5 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  ) : null}
                </p>
              </div>
              <ul className="max-h-[calc(100vh-280px)] divide-y divide-slate-100 overflow-y-auto">
                {visible.map((n) => {
                  const isUnread = hydrated && !readIds.has(n.id);
                  const isSelected = selectedId === n.id;
                  const Icon = CATEGORY_ICONS[n.category];

                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(n)}
                        className={cn(
                          "flex w-full gap-3 px-4 py-4 text-left transition-colors",
                          isSelected
                            ? "bg-[#F5F3FF]"
                            : "hover:bg-slate-50/90",
                          isUnread && !isSelected && "bg-[#F5F3FF]/40",
                        )}
                      >
                        {isUnread || isSelected ? (
                          <NotificationIconBadge icon={Icon} size="sm" />
                        ) : (
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <Icon className="h-4 w-4" />
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <p
                              className={cn(
                                "truncate text-sm",
                                isUnread
                                  ? "font-bold text-slate-900"
                                  : "font-medium text-slate-700",
                              )}
                            >
                              {n.title}
                            </p>
                            {isUnread ? (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#6D28D9]" />
                            ) : null}
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                            {n.description}
                          </p>
                          <p className="mt-1.5 text-[11px] text-slate-400">
                            {formatNotificationTimestamp(n.time)}
                          </p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Message detail — always visible on desktop when a message is selected */}
            <div
              className={cn(
                "min-w-0 flex-1 bg-white",
                mobileShowDetail ? "block" : "hidden lg:flex lg:flex-col",
              )}
            >
              <AnimatePresence mode="wait">
                {selected ? (
                  <NotificationDetail
                    key={selected.id}
                    notification={selected}
                    isUnread={hydrated && !readIds.has(selected.id)}
                    onMarkRead={() => handleMarkRead(selected.id)}
                    onDelete={() => handleDelete(selected.id)}
                    onBack={() => setMobileShowDetail(false)}
                  />
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex h-full min-h-[320px] flex-col items-center justify-center px-6 py-16 text-center"
                  >
                    <Bell className="h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Select a notification
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose a message from your inbox to read it here.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}

function NotificationDetail({
  notification,
  isUnread,
  onMarkRead,
  onDelete,
  onBack,
}: {
  notification: PortalNotification;
  isUnread: boolean;
  onMarkRead: () => void;
  onDelete: () => void;
  onBack: () => void;
}) {
  const Icon = CATEGORY_ICONS[notification.category];
  const categoryLabel = NOTIFICATION_CATEGORY_LABELS[notification.category];

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2 }}
      className="flex h-full flex-col"
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 lg:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {isUnread ? (
            <button
              type="button"
              onClick={onMarkRead}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              <Check className="h-3.5 w-3.5" />
              Mark as read
            </button>
          ) : null}
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <div className="flex items-start gap-4">
          <NotificationIconBadge icon={Icon} size="lg" rounded="xl" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                {categoryLabel}
              </span>
              {isUnread ? (
                <span className="rounded-full bg-[#6D28D9]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#6D28D9]">
                  Unread
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Read
                </span>
              )}
            </div>
            <h2 className="mt-3 text-xl font-bold text-slate-900">
              {notification.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {formatNotificationTimestamp(notification.time)}
              {notification.brandName ? (
                <span className="text-slate-400">
                  {" "}
                  · {notification.brandName}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-6">
          <p className="text-base leading-relaxed text-slate-700">
            {notification.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function matchesNotificationPrefs(
  category: NotificationCategory,
  prefs: SettingsPreferences,
): boolean {
  if (!prefs.platformNotifications) return false;
  if (
    category === "review_started" ||
    category === "brand_submitted" ||
    category === "edit_window_expired"
  ) {
    return prefs.reviewUpdates;
  }
  if (category === "brand_approved" || category === "marketplace_published") {
    return prefs.approvalUpdates;
  }
  return true;
}

function NotificationIconBadge({
  icon: Icon,
  size = "sm",
  rounded = "full",
}: {
  icon: LucideIcon;
  size?: "sm" | "lg";
  rounded?: "full" | "xl";
}) {
  return (
    <span
      className={cn(
        "dash-on-color flex shrink-0 items-center justify-center bg-[#6D28D9] text-white",
        size === "lg" ? "h-12 w-12" : "h-9 w-9",
        rounded === "xl" ? "rounded-2xl" : "rounded-full",
      )}
    >
      <Icon
        className={cn(size === "lg" ? "h-5 w-5" : "h-4 w-4")}
        strokeWidth={2}
      />
    </span>
  );
}
