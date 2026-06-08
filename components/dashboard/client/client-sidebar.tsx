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
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const active = isNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ease-out",
        active
          ? "text-white shadow-[0_6px_20px_rgba(109,40,217,0.42)]"
          : "text-slate-600 hover:scale-[1.02] hover:bg-slate-50 hover:text-slate-900 hover:shadow-sm",
        collapsed && "justify-center px-2.5",
      )}
    >
      {active ? (
        <motion.span
          layoutId="client-nav-active"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#5B21B6] to-[#4F46E5]"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          active ? "text-white" : "text-slate-500 group-hover:text-[#6D28D9]",
        )}
      >
        <NavIcon name={item.icon} active={active} />
      </span>
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
          className="hidden rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-800 lg:block"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-5 w-5" />
          ) : (
            <PanelLeftClose className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain p-3">
        {groups.map((group, groupIndex) => (
          <div
            key={group.label || group.items[0]?.href || `nav-group-${groupIndex}`}
            className="space-y-0.5"
          >
            {group.items.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                pathname={pathname}
                collapsed={collapsed}
              />
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}
