"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { SidebarBrandFooter } from "@/components/dashboard/client/sidebar-brand-footer";
import { NavIcon } from "@/components/layout/nav-icon";
import { isNavItemActive } from "@/lib/nav/is-nav-active";
import type { ClientNavGroup } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  groups: ClientNavGroup[];
  userId?: string | null;
};

export function MobileDrawer({
  open,
  onClose,
  groups,
  userId,
}: MobileDrawerProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 36 }}
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(85vw,20rem)] flex-col border-r border-slate-200 bg-white lg:hidden"
          >
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 px-4">
              <span className="text-sm font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-50"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {groups.map((group, groupIndex) => (
                <div
                  key={group.label || group.items[0]?.href || `nav-group-${groupIndex}`}
                  className="space-y-0.5"
                >
                  {group.items.map((item) => {
                    const active = isNavItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "group relative mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                          active
                            ? "text-white shadow-[0_6px_20px_rgba(109,40,217,0.42)]"
                            : "text-slate-600 hover:scale-[1.02] hover:bg-slate-50 hover:shadow-sm",
                        )}
                      >
                        {active ? (
                          <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6D28D9] via-[#5B21B6] to-[#4F46E5]" />
                        ) : null}
                        <span
                          className={cn(
                            "relative z-10 flex h-8 w-8 items-center justify-center rounded-lg",
                            active ? "text-white" : "text-slate-500",
                          )}
                        >
                          <NavIcon name={item.icon} active={active} />
                        </span>
                        <span className="relative z-10 flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
            <SidebarBrandFooter collapsed={false} userId={userId} />
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
