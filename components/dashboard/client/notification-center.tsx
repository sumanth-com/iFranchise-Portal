"use client";

import { formatDate } from "@/lib/format-date";
import {
  deleteNotification,
  getDeletedNotificationIds,
  getReadNotificationIds,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/read-state";
import { NOTIFICATION_CATEGORY_LABELS } from "@/lib/notifications/types";
import type { PortalNotification } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";
import { Bell, Check, CheckCheck, ExternalLink, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type NotificationCenterProps = {
  userId: string;
  notifications: PortalNotification[];
};

function splitDateTime(iso: string | null): { date: string; time: string } {
  if (!iso) return { date: "—", time: "—" };
  const d = new Date(iso);
  return {
    date:
      formatDate(iso) ??
      d.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    time: d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
}

export function NotificationCenter({
  userId,
  notifications,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setReadIds(getReadNotificationIds(userId));
    setDeletedIds(getDeletedNotificationIds(userId));
  }, [userId]);

  const visible = useMemo(
    () => notifications.filter((n) => !deletedIds.has(n.id)),
    [notifications, deletedIds],
  );

  const unreadCount = useMemo(
    () => visible.filter((n) => !readIds.has(n.id)).length,
    [visible, readIds],
  );

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
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white text-slate-600 transition-all hover:border-[#6D28D9]/30 hover:bg-[#6D28D9]/5 hover:text-[#6D28D9] hover:shadow-sm"
        aria-label={`Notifications${mounted && unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {mounted && unreadCount > 0 ? (
          <span className="dash-on-color absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#6D28D9] px-1 text-[10px] font-bold !text-white shadow-sm">
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
          <div className="absolute right-0 z-50 mt-2 w-[min(100vw-2rem,24rem)] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.15)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Notifications
                </h2>
                {mounted && unreadCount > 0 ? (
                  <p className="text-xs text-[#6D28D9]">{unreadCount} unread</p>
                ) : null}
              </div>
              <div className="flex items-center gap-1">
                {mounted && unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-[#6D28D9] hover:bg-[#6D28D9]/10"
                    title="Mark all read"
                  >
                    <CheckCheck className="h-3.5 w-3.5" />
                    Mark all read
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="max-h-[min(70vh,28rem)] overflow-y-auto">
              {visible.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Bell className="mx-auto h-8 w-8 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No notifications
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Updates about your brands will appear here.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {visible.map((n) => {
                    const isUnread = mounted && !readIds.has(n.id);
                    const { date, time } = splitDateTime(n.time);
                    return (
                      <li
                        key={n.id}
                        className={cn(
                          "group relative px-4 py-3 transition-colors",
                          isUnread
                            ? "border-l-2 border-l-[#6D28D9] bg-[#6D28D9]/[0.06]"
                            : "bg-white hover:bg-slate-50/80",
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-semibold uppercase tracking-wide text-[#6D28D9]">
                            {NOTIFICATION_CATEGORY_LABELS[n.category]}
                          </p>
                          <p className="mt-0.5 text-sm font-semibold text-slate-900">
                            {n.title}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                            {n.description}
                          </p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
                            <span>{date}</span>
                            <span>{time}</span>
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 font-medium",
                                isUnread
                                  ? "bg-[#6D28D9]/15 text-[#6D28D9]"
                                  : "bg-slate-100 text-slate-500",
                              )}
                            >
                              {isUnread ? "Unread" : "Read"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          {isUnread ? (
                            <button
                              type="button"
                              onClick={() => handleMarkRead(n.id)}
                              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                            >
                              <Check className="h-3 w-3" />
                              Mark as read
                            </button>
                          ) : null}
                          <Link
                            href={n.href}
                            onClick={() => {
                              handleMarkRead(n.id);
                              setOpen(false);
                            }}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#6D28D9] hover:bg-[#6D28D9]/10"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View details
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(n.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-red-600 opacity-0 transition-opacity hover:bg-red-50 group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-2.5">
              <Link
                href="/dashboard/notifications"
                onClick={() => setOpen(false)}
                className="block text-center text-xs font-medium text-[#6D28D9] hover:underline"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
