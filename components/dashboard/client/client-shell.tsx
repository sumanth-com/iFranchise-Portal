"use client";

import { Suspense, useEffect, useState, type ReactNode } from "react";

import { ClientSidebar } from "@/components/dashboard/client/client-sidebar";
import { ClientTopbar } from "@/components/dashboard/client/client-topbar";
import { AuthSessionGuard } from "@/components/auth/auth-session-guard";
import { MobileBottomNav } from "@/components/dashboard/client/mobile-bottom-nav";
import { MobileDrawer } from "@/components/dashboard/client/mobile-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import { ToastProvider } from "@/components/ui/toast-provider";
import { clientNav, clientNavGroups } from "@/lib/nav-config";
import {
  applyTheme,
  loadSettings,
} from "@/lib/settings/client-preferences";

type ClientShellProps = {
  children: ReactNode;
  userId: string;
  email: string;
  name?: string | null;
};

export function ClientShell({
  children,
  userId,
  email,
  name,
}: ClientShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    applyTheme(loadSettings(userId).theme);
  }, [userId]);

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
    <ToastProvider>
      <AuthSessionGuard />
      <div
        data-dashboard="client"
        className="flex h-dvh overflow-hidden bg-[#F8FAFC] text-slate-900 dark:bg-slate-950 dark:text-slate-100"
      >
        <Suspense fallback={null}>
          <ClientSidebar
            groups={clientNavGroups}
            collapsed={collapsed}
            userId={userId}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </Suspense>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-20 lg:pb-0">
          <ClientTopbar userId={userId} email={email} name={name} />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
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
            userId={userId}
          />
        </Suspense>
      </div>
    </ToastProvider>
  );
}
