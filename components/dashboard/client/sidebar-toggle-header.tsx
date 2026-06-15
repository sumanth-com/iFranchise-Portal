"use client";

import Link from "next/link";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

type SidebarToggleHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
  homeHref?: string;
};

const toggleButtonClass =
  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-500 shadow-sm transition-colors hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700";

export function SidebarToggleHeader({
  collapsed,
  onToggle,
  homeHref = "/dashboard",
}: SidebarToggleHeaderProps) {
  return (
    <div
      className={cn(
        "flex h-[var(--topbar-height)] shrink-0 items-center border-b border-slate-200/80 px-3",
        collapsed ? "justify-center" : "justify-between gap-2",
      )}
    >
      {!collapsed ? (
        <Link
          href={homeHref}
          className="flex min-w-0 items-center gap-2.5"
          aria-label="iFranchise home"
        >
          <Logo size="sm" showText={false} variant="mono" markVariant="nav" />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-bold text-slate-900">iFranchise</p>
            <p className="truncate text-[10px] font-medium text-slate-500">
              Marketplace
            </p>
          </div>
        </Link>
      ) : null}
      <button
        type="button"
        onClick={onToggle}
        className={toggleButtonClass}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <PanelLeftOpen className="h-3.5 w-3.5" />
        ) : (
          <PanelLeftClose className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}
