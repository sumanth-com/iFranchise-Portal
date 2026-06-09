"use client";

import Link from "next/link";
import { Bell, LogOut, Shield } from "lucide-react";

import { logout } from "@/lib/auth/actions";
import { resolveFirstName } from "@/lib/utils";

type AdminTopbarProps = {
  userId: string;
  email: string;
  name?: string | null;
  notificationCount?: number;
};

export function AdminTopbar({
  email,
  name,
  notificationCount = 0,
}: AdminTopbarProps) {
  const displayName = resolveFirstName(name, email);

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-md sm:px-6">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Shield className="h-4 w-4" />
        </span>
        <div className="hidden sm:block">
          <p className="text-sm font-semibold text-slate-900">Admin Command Center</p>
          <p className="text-xs text-slate-500">Brand review & publishing</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Link
          href="/admin/notifications"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {notificationCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-white">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          ) : null}
        </Link>

        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{email}</p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}
