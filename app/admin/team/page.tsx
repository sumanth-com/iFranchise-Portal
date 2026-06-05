import { TeamManagement } from "@/components/team/TeamManagement";
import { requireTeamAccess } from "@/lib/auth/session";
import {
  canDisableTeamMembers,
  canEditTeamRoles,
  canInviteTeam,
} from "@/lib/team/permissions";
import {
  getActivityLogs,
  getPendingInvitations,
  getTeamMembers,
} from "@/lib/team/queries";
import type { TeamRole } from "@/types/team";

export default async function TeamPage() {
  const profile = await requireTeamAccess();
  const teamRole = profile.team_role as TeamRole;

  const [{ members, error: membersError }, { invitations }, { logs }] =
    await Promise.all([
      getTeamMembers(),
      getPendingInvitations(),
      getActivityLogs(40),
    ]);

  return (
    <>
      {membersError ? (
        <p
          className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {membersError}
          <span className="mt-2 block text-xs">
            Run migration 004_team_management.sql in Supabase if you have not
            yet.
          </span>
        </p>
      ) : null}
      <TeamManagement
        currentProfile={profile}
        members={members}
        invitations={invitations}
        logs={logs}
        canInvite={canInviteTeam(teamRole)}
        canEdit={canEditTeamRoles(teamRole)}
        canDisable={canDisableTeamMembers(teamRole)}
      />
    </>
  );
}
