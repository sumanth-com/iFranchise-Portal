"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Building2, RefreshCw, Send } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { formatNotificationTimestamp } from "@/lib/format-date";
import {
  ADMIN_NOTIFICATIONS_READ_EVENT,
  countAdminUnread,
  getAdminReadNotificationIds,
  markAdminNotificationRead,
} from "@/lib/notifications/admin-read-state";
import type {
  AdminNotificationCategory,
  AdminNotificationPreview,
} from "@/lib/notifications/types";

const CATEGORY_ICONS: Record<AdminNotificationCategory, LucideIcon> = {
  new_submission: Send,
  resubmission: RefreshCw,
  owner_activity: Building2,
};

type AdminNotificationBellProps = {
  userId: string;
  notifications: AdminNotificationPreview[];
};

export function AdminNotificationBell({
  userId,
  notifications,
}: AdminNotificationBellProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());

  const refreshReadState = useCallback(() => {
    setReadIds(getAdminReadNotificationIds(userId));
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    refreshReadState();
    const onReadChange = () => refreshReadState();
    window.addEventListener(ADMIN_NOTIFICATIONS_READ_EVENT, onReadChange);
    return () =>
      window.removeEventListener(ADMIN_NOTIFICATIONS_READ_EVENT, onReadChange);
  }, [refreshReadState]);

  const unreadCount = useMemo(() => {
    if (!hydrated) return 0;
    return countAdminUnread(
      userId,
      notifications.map((n) => n.id),
    );
  }, [hydrated, userId, notifications, readIds]);

  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !readIds.has(n.id)),
    [notifications, readIds],
  );

  function handleOpenNotification(id: string) {
    markAdminNotificationRead(userId, id);
    setReadIds((prev) => new Set([...prev, id]));
    setOpen(false);
    router.push(`/admin/notifications?n=${encodeURIComponent(id)}`);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-violet-700"
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="h-[18px] w-[18px]" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-violet-600 px-0.5 text-[9px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-lg">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">
                Notifications
              </p>
              <p className="text-xs text-slate-500">
                {unreadCount > 0
                  ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}`
                  : "You're all caught up"}
              </p>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {unreadNotifications.length === 0 ? (
                <p className="px-4 py-6 text-center text-sm text-slate-500">
                  No new messages right now.
                </p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {unreadNotifications.map((notification) => {
                    const Icon = CATEGORY_ICONS[notification.category];
                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() =>
                            handleOpenNotification(notification.id)
                          }
                          className="flex w-full gap-3 px-4 py-3.5 text-left transition-colors hover:bg-violet-50/60"
                        >
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-start justify-between gap-2">
                              <span className="truncate text-sm font-semibold text-slate-900">
                                {notification.title}
                              </span>
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                            </span>
                            <span className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                              {notification.description}
                            </span>
                            <span className="mt-1 block text-[11px] text-slate-400">
                              {formatNotificationTimestamp(notification.time)}
                            </span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5">
              <Link
                href="/admin/notifications"
                onClick={() => setOpen(false)}
                className="block rounded-lg py-2 text-center text-xs font-semibold text-violet-700 transition-colors hover:bg-violet-50"
              >
                Open notifications inbox
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
