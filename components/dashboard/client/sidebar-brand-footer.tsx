"use client";

import { LogOut } from "lucide-react";

import { LogoutControl } from "@/components/auth/logout-control";
import { cn } from "@/lib/utils";

type SidebarBrandFooterProps = {
  collapsed: boolean;
  userId?: string | null;
};

export function SidebarBrandFooter({
  collapsed,
  userId,
}: SidebarBrandFooterProps) {
  return (
    <div
      className={cn(
        "shrink-0 border-t border-slate-200/80 bg-slate-50/50",
        collapsed ? "px-2 py-3" : "px-3 py-3.5",
      )}
    >
      <LogoutControl userId={userId} className="w-full">
        <button
          type="submit"
          className={cn(
            "flex w-full items-center rounded-lg text-slate-600 transition-colors hover:bg-slate-200/60 hover:text-red-600",
            collapsed
              ? "h-9 justify-center"
              : "gap-2.5 px-3 py-2 text-sm font-medium",
          )}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed ? <span>Logout</span> : null}
        </button>
      </LogoutControl>
    </div>
  );
}
