"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { cn } from "@/lib/utils";

type SidebarToggleHeaderProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const toggleButtonClass =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/90 bg-white text-slate-500 shadow-sm transition-colors hover:border-[#6D28D9]/25 hover:bg-[#F5F3FF] hover:text-[#6D28D9]";

export function SidebarToggleHeader({
  collapsed,
  onToggle,
}: SidebarToggleHeaderProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center border-b border-slate-200/80",
        collapsed ? "justify-center px-2 py-3.5" : "h-12 justify-end px-2.5",
      )}
    >
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
