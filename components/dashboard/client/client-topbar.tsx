"use client";

import { Bell, Search } from "lucide-react";
import Link from "next/link";

import { UserMenu } from "@/components/layout/user-menu";

type ClientTopbarProps = {
  title: string;
  subtitle?: string;
  email: string;
  name?: string | null;
};

export function ClientTopbar({
  title,
  subtitle,
  email,
  name,
}: ClientTopbarProps) {
  return (
    <header className="z-30 flex h-[var(--topbar-height)] shrink-0 items-center justify-between gap-4 border-b border-neutral-300 bg-white px-4 text-black sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-base font-semibold text-black sm:text-lg">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs text-black sm:text-sm">{subtitle}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-black md:flex">
          <Search className="h-4 w-4 text-black" />
          <span className="text-sm text-black">Search...</span>
        </div>
        <Link
          href="/dashboard/notifications"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-300 bg-white text-black transition-colors hover:bg-neutral-100"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
        </Link>
        <UserMenu email={email} name={name} role="client" variant="mono" />
      </div>
    </header>
  );
}
