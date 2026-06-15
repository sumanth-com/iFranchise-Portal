"use client";

import { usePathname } from "next/navigation";

import { UserAvatar } from "@/components/dashboard/client/user-avatar";
import { AdminNotificationBell } from "@/components/admin/admin-notification-bell";
import { resolveFirstName } from "@/lib/utils";
import type { AdminNotificationPreview } from "@/lib/notifications/types";

type AdminTopbarProps = {
  userId: string;
  email: string;
  name?: string | null;
  notifications?: AdminNotificationPreview[];
};

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/reviews": "Review queue",
  "/admin/brands": "All brands",
  "/admin/notifications": "Notifications",
  "/admin/leads": "Investor leads",
  "/admin/admin-management": "Command center",
  "/admin/team": "Team",
};

function resolvePageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/admin/brands/")) return "Brand review";
  return "Marketplace admin";
}

export function AdminTopbar({
  userId,
  email,
  name,
  notifications = [],
}: AdminTopbarProps) {
  const pathname = usePathname();
  const displayName = resolveFirstName(name, email);
  const pageTitle = resolvePageTitle(pathname);

  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] shrink-0 items-center justify-between border-b border-slate-200/80 bg-white px-4 sm:px-5 lg:px-6">
      <div className="min-w-0">
        <p className="truncate text-base font-semibold tracking-tight text-slate-900 sm:text-lg">
          {pageTitle}
        </p>
        <p className="hidden text-xs text-slate-500 sm:block">
          iFranchise marketplace operations
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <AdminNotificationBell userId={userId} notifications={notifications} />

        <div className="hidden h-6 w-px bg-slate-200 sm:block" aria-hidden />

        <div
          className="flex min-w-0 items-center gap-2"
          title={email}
        >
          <UserAvatar
            userId={userId}
            email={email}
            name={name}
            size="sm"
            className="rounded-lg ring-1 ring-slate-200/80"
          />
          <span className="hidden max-w-[9rem] truncate text-sm font-medium text-slate-700 sm:inline">
            {displayName}
          </span>
        </div>
      </div>
    </header>
  );
}
