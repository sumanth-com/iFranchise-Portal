"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Menu } from "lucide-react";

import { NavIcon } from "@/components/layout/nav-icon";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileBottomNavProps = {
  items: NavItem[];
  onOpenDrawer: () => void;
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

export function MobileBottomNav({ items, onOpenDrawer }: MobileBottomNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileItems = items.filter((item) => item.mobileLabel != null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-300 bg-white px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 text-black lg:hidden">
      <ul className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const active = isNavItemActive(pathname, searchParams, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-[4rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-black",
                  active && "font-bold",
                )}
              >
                <NavIcon name={item.icon} className="h-5 w-5 text-black" />
                {item.mobileLabel}
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={onOpenDrawer}
            className="flex min-w-[4rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium text-black"
          >
            <Menu className="h-5 w-5" />
            Menu
          </button>
        </li>
      </ul>
    </nav>
  );
}
