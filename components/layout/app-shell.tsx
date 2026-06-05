"use client";

import { useState, type ReactNode } from "react";

import { MobileFab } from "@/components/layout/mobile-fab";
import { MobileNav } from "@/components/layout/mobile-nav";
import { PageTransition } from "@/components/layout/page-transition";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import type { NavItem } from "@/lib/nav-config";

type AppShellProps = {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  email: string;
  name?: string | null;
  role: "client" | "admin";
  topActions?: ReactNode;
};

export function AppShell({
  children,
  navItems,
  title,
  subtitle,
  email,
  name,
  role,
  topActions,
}: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-dvh bg-white">
      <Sidebar
        items={navItems}
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
      />
      <div className="flex min-w-0 flex-1 flex-col pb-20 lg:pb-0">
        <TopBar
          title={title}
          subtitle={subtitle}
          email={email}
          name={name}
          role={role}
          actions={topActions}
        />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileNav items={navItems} />
      {role === "client" ? <MobileFab /> : null}
    </div>
  );
}
