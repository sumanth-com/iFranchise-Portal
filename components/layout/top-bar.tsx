import { Bell } from "lucide-react";
import type { ReactNode } from "react";

import { UserMenu } from "@/components/layout/user-menu";

type TopBarProps = {
  title: string;
  subtitle?: string;
  email: string;
  name?: string | null;
  role: "client" | "admin";
  actions?: ReactNode;
};

export function TopBar({
  title,
  subtitle,
  email,
  name,
  role,
  actions,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex h-[var(--topbar-height)] items-center justify-between gap-4 border-b border-border bg-surface/90 px-4 backdrop-blur-md sm:px-6">
      <div className="min-w-0">
        <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="truncate text-xs text-slate-500 sm:text-sm">{subtitle}</p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {actions}
        <button
          type="button"
          className="relative hidden rounded-[var(--radius-md)] p-2 text-slate-500 hover:bg-surface-muted sm:block"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent-500" />
        </button>
        <UserMenu email={email} name={name} role={role} />
      </div>
    </header>
  );
}
