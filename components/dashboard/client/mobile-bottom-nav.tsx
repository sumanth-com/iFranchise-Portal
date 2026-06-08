"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import { isNavItemActive } from "@/lib/nav/is-nav-active";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  items: NavItem[];
  onOpenDrawer: () => void;
};

export function MobileBottomNav({ items, onOpenDrawer }: MobileBottomNavProps) {
  const pathname = usePathname();
  const mobileItems = items.filter((item) => item.mobileLabel != null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden">
      <ul className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const active = isNavItemActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "relative flex min-w-[4rem] flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-all duration-200",
                  active
                    ? "font-bold text-[#6D28D9]"
                    : "text-slate-500 hover:text-slate-700",
                )}
              >
                {active ? (
                  <span className="absolute inset-x-1 -top-0.5 h-0.5 rounded-full bg-gradient-to-r from-[#6D28D9] to-[#5B21B6]" />
                ) : null}
                <NavIcon
                  name={item.icon}
                  className={cn("h-5 w-5", active && "text-[#6D28D9]")}
                />
                {item.mobileLabel}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex min-w-[4rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-slate-500"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </li>
      </ul>
    </nav>
  );
}
