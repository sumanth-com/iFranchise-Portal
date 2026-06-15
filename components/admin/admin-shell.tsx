"use client";

import { Suspense, useState, type ReactNode } from "react";

import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AuthSessionGuard } from "@/components/auth/auth-session-guard";
import { MobileBottomNav } from "@/components/dashboard/client/mobile-bottom-nav";
import { MobileDrawer } from "@/components/dashboard/client/mobile-drawer";
import { PageTransition } from "@/components/layout/page-transition";
import { ToastProvider } from "@/components/ui/toast-provider";
import { adminNavGroups, type ClientNavGroup } from "@/lib/nav-config";
import type { AdminNotificationPreview } from "@/lib/notifications/types";

type AdminShellProps = {
  children: ReactNode;
  userId: string;
  email: string;
  name?: string | null;
  notifications?: AdminNotificationPreview[];
  navGroups?: ClientNavGroup[];
};

export function AdminShell({
  children,
  userId,
  email,
  name,
  notifications = [],
  navGroups = adminNavGroups,
}: AdminShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navItems = navGroups.flatMap((g) => g.items);

  return (
    <ToastProvider>
      <AuthSessionGuard />
      <div
        data-dashboard="admin"
        className="flex h-dvh overflow-hidden bg-[#F8FAFC] text-slate-900"
      >
        <Suspense fallback={null}>
          <AdminSidebar
            groups={navGroups}
            collapsed={collapsed}
            userId={userId}
            onToggle={() => setCollapsed((v) => !v)}
          />
        </Suspense>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-20 lg:pb-0">
          <AdminTopbar
            userId={userId}
            email={email}
            name={name}
            notifications={notifications}
          />
          <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain scroll-smooth antialiased">
            <div className="w-full px-3 py-5 sm:px-4 sm:py-6 lg:px-5">
              <PageTransition>{children}</PageTransition>
            </div>
          </main>
        </div>

        <Suspense fallback={null}>
          <MobileBottomNav
            items={navItems.filter((item) =>
              ["/admin", "/admin/reviews", "/admin/brands", "/admin/notifications"].includes(
                item.href,
              ),
            )}
            onOpenDrawer={() => setDrawerOpen(true)}
          />
        </Suspense>

        <Suspense fallback={null}>
          <MobileDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            groups={navGroups}
            userId={userId}
          />
        </Suspense>
      </div>
    </ToastProvider>
  );
}
