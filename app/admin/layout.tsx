import type { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth/session";
import { adminNav } from "@/lib/nav-config";
import { canManageTeam } from "@/lib/team/permissions";
import type { TeamRole } from "@/types/team";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const profile = await requireAdmin();
  const teamRole = profile.team_role as TeamRole | null;
  const navItems = adminNav.filter(
    (item) =>
      item.href !== "/admin/team" || canManageTeam(teamRole),
  );

  return (
    <AppShell
      navItems={navItems}
      title="Review"
      subtitle="Brand submission queue"
      email={profile.email}
      name={profile.full_name}
      role="admin"
    >
      {children}
    </AppShell>
  );
}
