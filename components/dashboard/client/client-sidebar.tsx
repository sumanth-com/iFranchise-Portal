"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { Logo } from "@/components/ui/logo";
import { isNavItemActive } from "@/lib/nav/is-nav-active";
import type { ClientNavGroup, NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type ClientSidebarProps = {
  groups: ClientNavGroup[];
  collapsed: boolean;
  onToggle: () => void;
};

function NavLink({
  item,
  pathname,
  collapsed,
  nested = false,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  nested?: boolean;
}) {
  const active = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
        nested && !collapsed && "ml-3 py-2",
        active
          ? "text-[#6D28D9]"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        collapsed && "justify-center px-2",
      )}
    >
      {active ? (
        <motion.span
          layoutId="client-nav-active"
          className="absolute inset-0 rounded-xl bg-[#F5F3FF] ring-1 ring-[#DDD6FE]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      ) : null}
      <NavIcon
        name={item.icon}
        className={cn(
          "relative z-10 h-4 w-4 shrink-0",
          active ? "text-[#6D28D9]" : "text-slate-500",
        )}
      />
      {!collapsed ? (
        <span className="relative z-10 flex-1 truncate">{item.label}</span>
      ) : null}
    </Link>
  );
}

export function ClientSidebar({
  groups,
  collapsed,
  onToggle,
}: ClientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-slate-200/80 bg-white transition-[width] duration-300 lg:sticky lg:top-0 lg:flex",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <div
        className={cn(
          "flex h-[var(--topbar-height)] shrink-0 items-center border-b border-slate-200/80 px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed ? (
          <Logo size="sm" variant="mono" />
        ) : (
          <Logo size="sm" showText={false} variant="mono" />
        )}
        <button
          type="button"
          onClick={onToggle}
          className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-50 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto overscroll-contain p-3">
        {groups.map((group, groupIndex) => (
          <div
            key={group.label || group.items[0]?.href || `nav-group-${groupIndex}`}
            className="mb-2"
          >
            {!collapsed && group.label ? (
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {group.label}
              </p>
            ) : null}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <NavLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  collapsed={collapsed}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
