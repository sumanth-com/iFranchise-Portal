"use client";

import { NotificationCenter } from "@/components/dashboard/client/notification-center";
import { ClientUserMenu } from "@/components/dashboard/client/client-user-menu";
import type { PortalNotification } from "@/lib/notifications/types";

type ClientTopbarProps = {
  title: string;
  subtitle?: string;
  userId: string;
  email: string;
  name?: string | null;
  notifications: PortalNotification[];
};

export function ClientTopbar({
  title,
  subtitle,
  userId,
  email,
  name,
  notifications,
}: ClientTopbarProps) {
  return (
    <header className="z-30 flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md sm:px-6 dark:border-slate-700/80 dark:bg-slate-900/80">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg dark:text-slate-100">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs text-slate-500 sm:text-sm dark:text-slate-400">
            {subtitle}
          </p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationCenter userId={userId} notifications={notifications} />
        <ClientUserMenu userId={userId} email={email} name={name} />
      </div>
    </header>
  );
}
