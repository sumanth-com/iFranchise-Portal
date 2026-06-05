"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { PanelLeft, PanelLeftClose } from "lucide-react";

import { SectionStatusIcon } from "@/components/dashboard/client/section-status-icon";
import { NavIcon } from "@/components/layout/nav-icon";
import { Logo } from "@/components/ui/logo";
import type { SectionProgress } from "@/lib/dashboard/section-completion";
import { progressByKey } from "@/lib/dashboard/section-completion";
import type { ClientNavGroup } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type ClientSidebarProps = {
  groups: ClientNavGroup[];
  sections: SectionProgress[];
  collapsed: boolean;
  onToggle: () => void;
};

function isNavItemActive(
  pathname: string,
  searchParams: URLSearchParams,
  href: string,
): boolean {
  const [path, query] = href.split("?");
  if (pathname !== path && !pathname.startsWith(`${path}/`)) {
    return false;
  }
  if (!query) {
    return pathname === path;
  }
  const expected = new URLSearchParams(query);
  return expected.get("step") === (searchParams.get("step") ?? "1");
}

export function ClientSidebar({
  groups,
  sections,
  collapsed,
  onToggle,
}: ClientSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const progress = progressByKey(sections);

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 flex-col overflow-hidden border-r border-neutral-300 bg-white text-black transition-[width] duration-300 lg:sticky lg:top-0 lg:flex",
        collapsed ? "w-[var(--sidebar-collapsed)]" : "w-[var(--sidebar-width)]",
      )}
    >
      <div
        className={cn(
          "flex h-[var(--topbar-height)] shrink-0 items-center border-b border-neutral-300 px-4",
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
          className="hidden rounded-lg p-2 text-black hover:bg-neutral-100 lg:block"
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
              <p className="mb-1.5 px-3 text-[10px] font-semibold uppercase tracking-wider text-black">
                {group.label}
              </p>
            ) : null}
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, searchParams, item.href);
              const sectionState = item.completionKey
                ? progress[item.completionKey]?.state ?? "not_started"
                : null;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black transition-colors",
                    active ? "text-black" : "hover:bg-white",
                    collapsed && "justify-center px-2",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId="client-nav-active"
                      className="absolute inset-0 rounded-xl border border-black bg-white"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  ) : null}
                  <NavIcon
                    name={item.icon}
                    className="relative z-10 h-4 w-4 shrink-0 text-black"
                  />
                  {!collapsed ? (
                    <>
                      <span className="relative z-10 flex-1 truncate text-black">
                        {item.label}
                      </span>
                      {sectionState ? (
                        <SectionStatusIcon
                          state={sectionState}
                          className="relative z-10 shrink-0"
                        />
                      ) : null}
                    </>
                  ) : null}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
