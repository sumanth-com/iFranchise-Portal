"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { NavIcon } from "@/components/layout/nav-icon";
import type { NavItem } from "@/lib/nav-config";
import { cn } from "@/lib/utils";

type MobileNavProps = {
  items: NavItem[];
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
  const expectedStep = expected.get("step");
  const currentStep = searchParams.get("step") ?? "1";
  return expectedStep === currentStep;
}

export function MobileNav({ items }: MobileNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mobileItems = items.filter((item) => item.mobileLabel != null);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-lg lg:hidden">
      <ul className="flex items-center justify-around">
        {mobileItems.map((item) => {
          const active = isNavItemActive(pathname, searchParams, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-w-[4.5rem] flex-col items-center gap-1 rounded-lg px-2 py-1.5 text-[10px] font-medium transition-colors",
                  active ? "text-primary-600" : "text-slate-500",
                )}
              >
                <NavIcon
                  name={item.icon}
                  className={cn("h-5 w-5", active && "text-primary-600")}
                />
                {item.mobileLabel ?? item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
