"use client";

import { LogOut } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { logout } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

type SidebarBrandFooterProps = {
  collapsed: boolean;
};

export function SidebarBrandFooter({ collapsed }: SidebarBrandFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-slate-200/80 bg-slate-50/50",
        collapsed ? "px-2 py-3" : "px-3 py-3.5",
      )}
    >
      {collapsed ? (
        <div className="flex flex-col items-center gap-2.5">
          <Logo size="sm" showText={false} variant="mono" markVariant="nav" />
          <form action={logout}>
            <button
              type="submit"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-red-600"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <Logo size="sm" variant="mono" className="min-w-0" />
          <form action={logout} className="shrink-0">
            <button
              type="submit"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-red-600"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
