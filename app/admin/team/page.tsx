import { TeamDirectoryPage } from "@/components/team/directory/team-directory-page";
import { requireTeamAccess } from "@/lib/auth/session";
import { isSuperAdminProfile } from "@/lib/auth/staff";
import { canInviteTeam } from "@/lib/team/permissions";
import { getPendingInvitations, getTeamMembers } from "@/lib/team/queries";
import type { TeamRole } from "@/types/team";

export default async function TeamPage() {
  const profile = await requireTeamAccess();
  const teamRole = profile.team_role as TeamRole;

  const [{ members, error: membersError }, { invitations }] = await Promise.all([
    getTeamMembers(),
    getPendingInvitations(),
  ]);

  return (
    <>
      {membersError ? (
        <p
          className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {membersError}
        </p>
      ) : null}
      <TeamDirectoryPage
        currentProfile={profile}
        supabaseMembers={members}
        pendingInvitations={invitations}
        isSuperAdmin={isSuperAdminProfile(profile)}
        canInvite={canInviteTeam(teamRole)}
      />
    </>
  );
}
