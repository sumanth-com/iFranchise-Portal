"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { isNavItemActive } from "@/lib/nav/is-nav-active";
import type { ClientNavGroup } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  groups: ClientNavGroup[];
};

export function MobileDrawer({ open, onClose, groups }: MobileDrawerProps) {
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
            <div className="flex h-[var(--topbar-height)] items-center justify-between border-b border-slate-200 px-4">
              <span className="text-sm font-semibold text-slate-900">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3">
              {groups.map((group, groupIndex) => (
                <div
                  key={group.label || group.items[0]?.href || `nav-group-${groupIndex}`}
                  className="mb-4"
                >
                  {group.label ? (
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                    </p>
                  ) : null}
                  {group.items.map((item) => {
                    const active = isNavItemActive(pathname, item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium",
                          active
                            ? "bg-[#F5F3FF] text-[#6D28D9] ring-1 ring-[#DDD6FE]"
                            : "text-slate-600 hover:bg-slate-50",
                        )}
                      >
                        <NavIcon name={item.icon} className="h-4 w-4" />
                        <span className="flex-1">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </nav>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
