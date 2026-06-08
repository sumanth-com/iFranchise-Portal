import type { ReactNode } from "react";

import { ClientShell } from "@/components/dashboard/client/client-shell";
import { getDashboardContext } from "@/lib/dashboard/context";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile } = await getDashboardContext();

  return (
    <ClientShell
      title="Brand Portal"
      subtitle="Manage and grow your franchise listings"
      userId={profile.id}
      email={profile.email}
      name={profile.full_name}
    >
      {children}
    </ClientShell>
  );
}
