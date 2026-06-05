"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeft } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { Logo } from "@/components/ui/logo";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type SidebarProps = {
  items: NavItem[];
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ items, collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-300 lg:flex",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <div
        className={cn(
          "flex h-[var(--topbar-height)] items-center border-b border-border px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? <Logo size="sm" /> : <Logo size="sm" showText={false} />}
        <button
          type="button"
          onClick={onToggle}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-surface-muted lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {items.map((item) => {
          const href = item.href.split("#")[0];
          const active =
            pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary-50 text-primary-700"
                  : "text-slate-600 hover:bg-surface-muted hover:text-foreground",
                collapsed && "justify-center px-2",
              )}
            >
              {active ? (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-[var(--radius-md)] bg-primary-50"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              ) : null}
              <NavIcon
                name={item.icon}
                className="relative z-10 h-5 w-5 shrink-0"
              />
              {!collapsed ? (
                <span className="relative z-10">{item.label}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
