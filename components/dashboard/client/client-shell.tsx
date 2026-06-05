"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { ClientSidebar } from "@/components/dashboard/client/client-sidebar";
import { ClientTopbar } from "@/components/dashboard/client/client-topbar";
import { MobileBottomNav } from "@/components/dashboard/client/mobile-bottom-nav";
import { MobileDrawer } from "@/components/dashboard/client/mobile-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import type { SectionProgress } from "@/lib/dashboard/section-completion";
import { clientNav, clientNavGroups } from "@/lib/nav-config";

type ClientShellProps = {
  children: ReactNode;
  title: string;
  subtitle?: string;
  email: string;
  name?: string | null;
  sections: SectionProgress[];
};

export function ClientShell({
  children,
  title,
  subtitle,
  email,
  name,
  sections,
}: ClientShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyOverflow = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div
      data-dashboard="client"
      className="flex h-dvh overflow-hidden bg-white text-black"
    >
      <Suspense fallback={null}>
        <ClientSidebar
          groups={clientNavGroups}
          sections={sections}
          collapsed={collapsed}
          onToggle={() => setCollapsed((v) => !v)}
        />
      </Suspense>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-20 lg:pb-0">
        <ClientTopbar
          title={title}
          subtitle={subtitle}
          email={email}
          name={name}
        />
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden bg-white text-black">
          <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>

      <Suspense fallback={null}>
        <MobileBottomNav
          items={clientNav}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
      </Suspense>

      <Suspense fallback={null}>
        <MobileDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          groups={clientNavGroups}
          sections={sections}
        />
      </Suspense>
    </div>
  );
}
