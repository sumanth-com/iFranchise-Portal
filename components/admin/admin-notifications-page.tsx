"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Bell,
  Building2,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  Send,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { formatNotificationTimestamp } from "@/lib/format-date";
import {
  ADMIN_NOTIFICATIONS_READ_EVENT,
  getAdminReadNotificationIds,
  markAdminNotificationRead,
} from "@/lib/notifications/admin-read-state";
import {
  ADMIN_NOTIFICATION_CATEGORY_LABELS,
  type AdminNotification,
  type AdminNotificationCategory,
  type AdminNotificationMessage,
} from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<AdminNotificationCategory, LucideIcon> = {
  new_submission: Send,
  resubmission: RefreshCw,
  owner_activity: Building2,
  team_admin: Users,
};

const CATEGORY_STYLES: Record<
  AdminNotificationCategory,
  { badge: string; icon: string; ring: string }
> = {
  new_submission: {
    badge: "bg-amber-50 text-amber-700 ring-amber-100",
    icon: "bg-amber-100 text-amber-700",
    ring: "ring-amber-200/80",
  },
  resubmission: {
    badge: "bg-sky-50 text-sky-700 ring-sky-100",
    icon: "bg-sky-100 text-sky-700",
    ring: "ring-sky-200/80",
  },
  owner_activity: {
    badge: "bg-violet-50 text-violet-700 ring-violet-100",
    icon: "bg-violet-100 text-violet-700",
    ring: "ring-violet-200/80",
  },
  team_admin: {
    badge: "bg-indigo-50 text-indigo-700 ring-indigo-100",
    icon: "bg-indigo-100 text-indigo-700",
    ring: "ring-indigo-200/80",
  },
};

const panelToggleClass =
  "inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white px-2.5 text-xs font-medium text-slate-600 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700";

type AdminNotificationsPageProps = {
  userId: string;
  notifications: AdminNotification[];
};

export function AdminNotificationsPage({
  userId,
  notifications,
}: AdminNotificationsPageProps) {
  const searchParams = useSearchParams();
  const queryNotificationId = searchParams.get("n");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileShowDetail, setMobileShowDetail] = useState(false);
  const [inboxOpen, setInboxOpen] = useState(true);
  const [readIds, setReadIds] = useState<Set<string>>(() => new Set());
  const [hydrated, setHydrated] = useState(false);
  const handledQueryRef = useRef<string | null>(null);

  const refreshReadState = useCallback(() => {
    const next = getAdminReadNotificationIds(userId);
    setReadIds((prev) => {
      if (
        prev.size === next.size &&
        [...prev].every((id) => next.has(id))
      ) {
        return prev;
      }
      return next;
    });
    setHydrated(true);
  }, [userId]);

  useEffect(() => {
    refreshReadState();
    const onReadChange = () => refreshReadState();
    window.addEventListener(ADMIN_NOTIFICATIONS_READ_EVENT, onReadChange);
    return () =>
      window.removeEventListener(ADMIN_NOTIFICATIONS_READ_EVENT, onReadChange);
  }, [refreshReadState]);

  const markRead = useCallback(
    (id: string) => {
      markAdminNotificationRead(userId, id);
      setReadIds((prev) => {
        if (prev.has(id)) return prev;
        return new Set([...prev, id]);
      });
    },
    [userId],
  );

  const stats = useMemo(
    () => ({
      total: notifications.length,
      newSubmissions: notifications.filter((n) => n.category === "new_submission")
        .length,
      resubmissions: notifications.filter((n) => n.category === "resubmission")
        .length,
      ownerActivity: notifications.filter((n) => n.category === "owner_activity")
        .length,
    }),
    [notifications],
  );

  const selected = useMemo(
    () => notifications.find((n) => n.id === selectedId) ?? null,
    [notifications, selectedId],
  );

  useEffect(() => {
    if (!queryNotificationId) return;
    if (!notifications.some((n) => n.id === queryNotificationId)) return;
    if (handledQueryRef.current === queryNotificationId) return;

    handledQueryRef.current = queryNotificationId;
    setSelectedId(queryNotificationId);
    setMobileShowDetail(true);
    markRead(queryNotificationId);
  }, [queryNotificationId, notifications, markRead]);

  useEffect(() => {
    if (notifications.length === 0) {
      setSelectedId(null);
      return;
    }

    if (
      queryNotificationId &&
      notifications.some((n) => n.id === queryNotificationId)
    ) {
      return;
    }

    setSelectedId((prev) => {
      if (prev && notifications.some((n) => n.id === prev)) return prev;
      const read = getAdminReadNotificationIds(userId);
      const firstUnread = notifications.find((n) => !read.has(n.id));
      return firstUnread?.id ?? notifications[0]?.id ?? null;
    });
  }, [notifications, queryNotificationId, userId]);

  function handleSelect(notification: AdminNotification) {
    setSelectedId(notification.id);
    setMobileShowDetail(true);
    markRead(notification.id);
  }

  return (
    <div className="w-full space-y-6 pb-10">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
          Activity center
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Notifications
        </h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500 sm:text-base">
          New submissions, resubmissions, and brand owner activity — all in one
          open inbox.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard label="Total alerts" value={stats.total} />
        <StatCard label="New submissions" value={stats.newSubmissions} />
        <StatCard label="Resubmissions" value={stats.resubmissions} />
        <StatCard label="Owner activity" value={stats.ownerActivity} />
      </div>

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up"
          description="New brand submissions and platform activity will show up here."
          className="min-h-[320px] border border-slate-200/90 bg-white"
        />
      ) : (
        <div className="sticky top-0 z-10 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex h-[calc(100dvh-var(--topbar-height)-1.5rem)] min-h-[520px] flex-col lg:flex-row">
            {inboxOpen ? (
              <div
                className={cn(
                  "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-slate-200 lg:w-[min(380px,34%)] lg:border-r",
                  mobileShowDetail
                    ? "hidden lg:flex"
                    : "flex",
                )}
              >
                <PanelHeader
                  label="Inbox"
                  count={notifications.length}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setInboxOpen(false)}
                      className={cn(panelToggleClass, "hidden lg:inline-flex")}
                      aria-label="Hide inbox"
                      title="Hide inbox"
                    >
                      <PanelLeftClose className="h-3.5 w-3.5" />
                      <span className="hidden xl:inline">Hide</span>
                    </button>
                  }
                />
                <ul className="min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain">
                  {notifications.map((notification) => {
                    const Icon = CATEGORY_ICONS[notification.category];
                    const styles = CATEGORY_STYLES[notification.category];
                    const isSelected = selectedId === notification.id;
                    const isUnread = hydrated && !readIds.has(notification.id);

                    return (
                      <li key={notification.id}>
                        <button
                          type="button"
                          onClick={() => handleSelect(notification)}
                          className={cn(
                            "flex w-full gap-3 px-4 py-4 text-left transition-colors sm:px-5",
                            isSelected
                              ? "bg-violet-50/80"
                              : "hover:bg-slate-50/90",
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                              styles.icon,
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "truncate text-sm",
                                  isSelected
                                    ? "font-bold text-slate-900"
                                    : "font-medium text-slate-700",
                                )}
                              >
                                {notification.title}
                              </p>
                            {isUnread ? (
                              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-violet-600" />
                            ) : null}
                            </div>
                            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-slate-500">
                              {notification.description}
                            </p>
                            <p className="mt-1.5 text-[11px] text-slate-400">
                              {formatNotificationTimestamp(notification.time)}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : null}

            <div
              className={cn(
                "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white",
                mobileShowDetail ? "flex" : "hidden lg:flex",
              )}
            >
              {selected ? (
                <NotificationDetail
                  notification={selected}
                  inboxOpen={inboxOpen}
                  onBack={() => setMobileShowDetail(false)}
                  onOpenInbox={() => setInboxOpen(true)}
                />
              ) : (
                <div className="flex h-full min-h-0 flex-col overflow-hidden">
                  <PanelHeader
                    label="Message"
                    leading={
                      !inboxOpen ? (
                        <button
                          type="button"
                          onClick={() => setInboxOpen(true)}
                          className={cn(panelToggleClass, "hidden lg:inline-flex")}
                          aria-label="Show inbox"
                        >
                          <PanelLeftOpen className="h-3.5 w-3.5" />
                          <span>Inbox</span>
                        </button>
                      ) : undefined
                    }
                  />
                  <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
                    <Bell className="h-10 w-10 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-600">
                      Select a notification
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Choose an alert from the inbox to read it here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PanelHeader({
  label,
  count,
  leading,
  trailing,
}: {
  label: string;
  count?: number;
  leading?: ReactNode;
  trailing?: ReactNode;
}) {
  return (
    <div className="flex h-[49px] shrink-0 items-center justify-between gap-2 border-b border-slate-100 px-4 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        {leading}
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
          {count != null ? (
            <span className="ml-2 font-bold text-slate-700">{count}</span>
          ) : null}
        </p>
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  );
}

function NotificationDetail({
  notification,
  inboxOpen,
  onBack,
  onOpenInbox,
}: {
  notification: AdminNotification;
  inboxOpen: boolean;
  onBack: () => void;
  onOpenInbox: () => void;
}) {
  const Icon = CATEGORY_ICONS[notification.category];
  const styles = CATEGORY_STYLES[notification.category];
  const categoryLabel =
    ADMIN_NOTIFICATION_CATEGORY_LABELS[notification.category];

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      <PanelHeader
        label="Message"
        leading={
          <>
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {!inboxOpen ? (
              <button
                type="button"
                onClick={onOpenInbox}
                className={cn(panelToggleClass, "hidden lg:inline-flex")}
                aria-label="Show inbox"
              >
                <PanelLeftOpen className="h-3.5 w-3.5" />
                <span>Inbox</span>
              </button>
            ) : null}
          </>
        }
      />

      <div className="shrink-0 border-b border-slate-100 px-4 py-5 sm:px-6">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1",
              styles.icon,
              styles.ring,
            )}
          >
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1 pt-0.5">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1",
                styles.badge,
              )}
            >
              {categoryLabel}
            </span>
            <h2 className="mt-2.5 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
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
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6 sm:py-7">
        <div
          className={cn(
            "mx-auto w-full",
            inboxOpen ? "max-w-2xl" : "max-w-3xl",
          )}
        >
          <ProfessionalMessageBody message={notification.message} />
        </div>
      </div>
    </div>
  );
}

function ProfessionalMessageBody({
  message,
}: {
  message: AdminNotificationMessage;
}) {
  return (
    <article className="text-slate-800">
      <p className="text-base font-medium text-slate-900">
        Dear {message.greetingName},
      </p>

      <div className="mt-6 space-y-5">
        {message.paragraphs.map((paragraph) => (
          <p
            key={paragraph}
            className="text-[15px] leading-[1.8] text-slate-700 sm:text-base"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {message.highlight ? (
        <div className="mt-7">
          <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
            {message.highlight.label}
          </p>
          <p className="mt-2 text-[15px] font-medium leading-relaxed text-slate-900 sm:text-base">
            {message.highlight.value}
          </p>
        </div>
      ) : null}

      {message.instructions ? (
        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-900">
            {message.instructions.title}
          </p>
          <ul className="mt-3 list-disc space-y-2.5 pl-5 text-[15px] leading-[1.75] text-slate-700 sm:text-base">
            {message.instructions.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {message.notice ? (
        <div className="mt-8">
          <p className="text-sm font-semibold text-slate-900">
            {message.notice.title}
          </p>
          <div className="mt-3 space-y-3">
            {message.notice.paragraphs.map((paragraph) => (
              <p
                key={paragraph}
                className="text-[15px] leading-[1.75] text-slate-600 sm:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <p className="text-[15px] leading-[1.8] text-slate-700 sm:text-base">
          {message.closing}
        </p>
        <p className="mt-6 whitespace-pre-line text-[15px] leading-[1.8] text-slate-700 sm:text-base">
          {message.signOff}
        </p>
      </div>
    </article>
  );
}
