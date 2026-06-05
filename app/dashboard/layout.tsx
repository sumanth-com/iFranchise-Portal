import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireClient } from "@/lib/auth/session";
import { clientNav } from "@/lib/nav-config";
import { getGreeting } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireClient();

  return (
    <AppShell
      navItems={clientNav}
      title="Dashboard"
      subtitle={getGreeting(profile.full_name)}
      email={profile.email}
      name={profile.full_name}
      role="client"
    >
      {children}
    </AppShell>
  );
}
