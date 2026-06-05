import type { ReactNode } from "react";

import { ClientShell } from "@/components/dashboard/client/client-shell";
import { getDashboardContext } from "@/lib/dashboard/context";
import { getGreeting } from "@/lib/utils";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { profile, sections } = await getDashboardContext();

  return (
    <ClientShell
      title="Brand Portal"
      subtitle={getGreeting(profile.full_name)}
      email={profile.email}
      name={profile.full_name}
      sections={sections}
    >
      {children}
    </ClientShell>
  );
}
