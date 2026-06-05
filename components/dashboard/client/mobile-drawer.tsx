"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

import { SectionStatusIcon } from "@/components/dashboard/client/section-status-icon";
import { NavIcon } from "@/components/layout/nav-icon";
import type { SectionProgress } from "@/lib/dashboard/section-completion";
import { progressByKey } from "@/lib/dashboard/section-completion";
import type { ClientNavGroup } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  groups: ClientNavGroup[];
  sections: SectionProgress[];
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
  if (!query) return pathname === path;
  const expected = new URLSearchParams(query);
  return expected.get("step") === (searchParams.get("step") ?? "1");
}

export function MobileDrawer({
  open,
  onClose,
  groups,
  sections,
}: MobileDrawerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const progress = progressByKey(sections);

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
            className="fixed bottom-0 left-0 top-0 z-50 flex w-[min(85vw,20rem)] flex-col border-r border-neutral-300 bg-white text-black lg:hidden"
          >
            <div className="flex h-[var(--topbar-height)] items-center justify-between border-b border-neutral-300 px-4">
              <span className="text-sm font-semibold text-black">Menu</span>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg p-2 text-black hover:bg-neutral-100"
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
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-black">
                      {group.label}
                    </p>
                  ) : null}
                  {group.items.map((item) => {
                    const active = isNavItemActive(
                      pathname,
                      searchParams,
                      item.href,
                    );
                    const sectionState = item.completionKey
                      ? progress[item.completionKey]?.state ?? "not_started"
                      : null;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onClose}
                        className={cn(
                          "mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-black",
                          active
                            ? "border border-black bg-white"
                            : "hover:bg-white",
                        )}
                      >
                        <NavIcon name={item.icon} className="h-4 w-4 text-black" />
                        <span className="flex-1">{item.label}</span>
                        {sectionState ? (
                          <SectionStatusIcon state={sectionState} />
                        ) : null}
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
