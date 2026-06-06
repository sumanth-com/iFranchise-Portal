import type { ReactNode } from "react";

import { ClientShell } from "@/components/dashboard/client/client-shell";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildPortalNotifications } from "@/lib/notifications/build-portal-notifications";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, brands } = await getDashboardContext();
  const firstName = profile.full_name?.trim().split(/\s+/)[0];
  const notifications = buildPortalNotifications(brands);

  return (
    <ClientShell
      title="Brand Portal"
      subtitle={
        firstName ? `Welcome back, ${firstName}` : "Manage your franchise listings"
      }
      userId={profile.id}
      email={profile.email}
      name={profile.full_name}
      notifications={notifications}
    >
      {children}
    </ClientShell>
  );
}
