"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarBrandFooter } from "@/components/dashboard/client/sidebar-brand-footer";
import { SidebarToggleHeader } from "@/components/dashboard/client/sidebar-toggle-header";
import { NavIcon } from "@/components/layout/nav-icon";
import { isAdminNavItemActive } from "@/lib/nav/is-admin-nav-active";
import type { ClientNavGroup, NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type AdminSidebarProps = {
  groups: ClientNavGroup[];
  collapsed: boolean;
  userId: string;
  onToggle: () => void;
};

const NAV_ACTIVE_GRADIENT =
  "absolute inset-0 rounded-xl bg-gradient-to-r from-slate-800 to-slate-900";

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const active = isAdminNavItemActive(pathname, item.href);

  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center font-semibold transition-all duration-200 ease-out",
        collapsed
          ? "mx-auto h-9 w-9 justify-center rounded-xl p-0"
          : "gap-2.5 rounded-xl px-3 py-2 text-sm",
        active
          ? "text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
      )}
    >
      {active ? (
        <motion.span
          layoutId="admin-nav-active"
          className={NAV_ACTIVE_GRADIENT}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center",
          collapsed ? "h-9 w-9" : "h-4 w-4",
          active ? "text-white" : "text-slate-500 group-hover:text-slate-800",
        )}
      >
        <NavIcon name={item.icon} active={active} />
      </span>
      {!collapsed ? (
        <span className="relative z-10 truncate">{item.label}</span>
      ) : null}
    </Link>
  );
}

export function AdminSidebar({
  groups,
  collapsed,
  userId,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-full shrink-0 flex-col border-r border-slate-200/80 bg-white lg:flex",
        collapsed ? "w-[72px]" : "w-[var(--sidebar-width)]",
      )}
    >
      <SidebarToggleHeader
        collapsed={collapsed}
        onToggle={onToggle}
        homeHref="/admin"
      />

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label || "main"} className="space-y-1">
            {group.label && !collapsed ? (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {group.label}
              </p>
            ) : null}
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

      <SidebarBrandFooter collapsed={collapsed} userId={userId} />
    </aside>
  );
}
