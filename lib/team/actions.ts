"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { getProfile } from "@/lib/auth/session";
import { isSuperAdminProfile } from "@/lib/auth/staff";
import { logActivity } from "@/lib/team/activity";
import {
  canAssignRole,
  canDisableTeamMembers,
  canEditTeamRoles,
  canInviteTeam,
  canManageTeam,
} from "@/lib/team/permissions";
import { getStaffProfile } from "@/lib/team/queries";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import {
  initialTeamActionState,
  type TeamActionState,
  type TeamRole,
} from "@/types/team";

function revalidateTeam() {
  revalidatePath("/admin/team");
}

async function requireTeamManager() {
  const profile = await getProfile();
  if (!profile || profile.role === "client" || !isSuperAdminProfile(profile)) {
    return { error: "Access denied.", actor: null, teamRole: null };
  }

  const staff = await getStaffProfile(profile.id);
  const teamRole = (staff?.team_role ?? "super_admin") as TeamRole;

  if (!staff?.is_active || !canManageTeam(teamRole, profile.role)) {
    return {
      error: "You do not have permission to manage the team.",
      actor: null,
      teamRole: null,
    };
  }

  return { error: null, actor: profile, teamRole };
}

async function getOrigin(): Promise<string> {
  const headersList = await headers();
  const origin = headersList.get("origin");
  if (origin) return origin;
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  if (host) return `${protocol}://${host}`;
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export async function inviteTeamMember(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const access = await requireTeamManager();
  if (access.error || !access.actor || !access.teamRole) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  if (!canInviteTeam(access.teamRole)) {
    return { error: "You cannot invite team members.", message: null };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const teamRole = String(formData.get("teamRole") ?? "").trim() as TeamRole;
  const fullName = String(formData.get("fullName") ?? "").trim() || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email is required.", message: null };
  }

  if (!canAssignRole(access.teamRole, teamRole)) {
    return { error: "You cannot assign this role.", message: null };
  }

  const supabase = await createClient();

  const { data: existingMember } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .not("team_role", "is", null)
    .maybeSingle();

  if (existingMember) {
    return { error: "This email is already a team member.", message: null };
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("team_invitations")
    .insert({
      email,
      team_role: teamRole,
      invited_by: access.actor.id,
    })
    .select("id, token")
    .single();

  if (inviteError) {
    return { error: inviteError.message, message: null };
  }

  const serviceClient = createServiceClient();
  const origin = await getOrigin();

  if (serviceClient) {
    const { error: authError } = await serviceClient.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          full_name: fullName,
          team_role: teamRole,
          invitation_id: invitation.id,
        },
        redirectTo: `${origin}/auth/callback?next=/admin`,
      },
    );

    if (authError) {
      await supabase
        .from("team_invitations")
        .update({ status: "revoked" })
        .eq("id", invitation.id);

      return {
        error: authError.message || "Failed to send invitation email.",
        message: null,
      };
    }
  }

  await logActivity({
    actorId: access.actor.id,
    action: "team.invite",
    entityType: "invitation",
    entityId: invitation.id,
    metadata: { email, team_role: teamRole },
  });

  revalidateTeam();

  const message = serviceClient
    ? `Invitation sent to ${email}.`
    : `Invitation created for ${email}. Configure SUPABASE_SERVICE_ROLE_KEY to send invite emails automatically.`;

  return { error: null, message };
}

export async function updateTeamMemberRole(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const access = await requireTeamManager();
  if (access.error || !access.actor || !access.teamRole) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  if (!canEditTeamRoles(access.teamRole)) {
    return { error: "You cannot edit roles.", message: null };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  const teamRole = String(formData.get("teamRole") ?? "").trim() as TeamRole;

  if (!memberId) {
    return { error: "Member ID is required.", message: null };
  }

  if (!canAssignRole(access.teamRole, teamRole)) {
    return { error: "You cannot assign this role.", message: null };
  }

  if (memberId === access.actor.id && teamRole !== access.teamRole) {
    return { error: "You cannot change your own role here.", message: null };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, team_role")
    .eq("id", memberId)
    .single();

  const { error } = await supabase
    .from("profiles")
    .update({ team_role: teamRole })
    .eq("id", memberId);

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: access.actor.id,
    action: "team.role_updated",
    entityType: "profile",
    entityId: memberId,
    metadata: {
      email: member?.email,
      from: member?.team_role,
      to: teamRole,
    },
  });

  revalidateTeam();
  return { error: null, message: "Role updated successfully." };
}

export async function setTeamMemberActive(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const access = await requireTeamManager();
  if (access.error || !access.actor || !access.teamRole) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  if (!canDisableTeamMembers(access.teamRole)) {
    return { error: "You cannot disable team members.", message: null };
  }

  const memberId = String(formData.get("memberId") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!memberId) {
    return { error: "Member ID is required.", message: null };
  }

  if (memberId === access.actor.id && !isActive) {
    return { error: "You cannot disable your own account.", message: null };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, team_role")
    .eq("id", memberId)
    .single();

  if (member?.team_role === "super_admin" && access.teamRole !== "super_admin") {
    return { error: "Only super admins can disable super admins.", message: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: isActive,
      disabled_at: isActive ? null : new Date().toISOString(),
      disabled_by: isActive ? null : access.actor.id,
    })
    .eq("id", memberId);

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: access.actor.id,
    action: isActive ? "team.member_enabled" : "team.member_disabled",
    entityType: "profile",
    entityId: memberId,
    metadata: { email: member?.email },
  });

  revalidateTeam();
  return {
    error: null,
    message: isActive ? "Team member re-enabled." : "Team member disabled.",
  };
}

export async function revokeInvitation(
  _prevState: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const access = await requireTeamManager();
  if (access.error || !access.actor) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  const invitationId = String(formData.get("invitationId") ?? "").trim();
  if (!invitationId) {
    return { error: "Invitation ID is required.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("team_invitations")
    .update({ status: "revoked" })
    .eq("id", invitationId)
    .eq("status", "pending");

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: access.actor.id,
    action: "team.invitation_revoked",
    entityType: "invitation",
    entityId: invitationId,
  });

  revalidateTeam();
  return { error: null, message: "Invitation revoked." };
}

/** Form actions without useActionState pass FormData as the only argument. */
export async function revokeInvitationForm(formData: FormData): Promise<void> {
  await revokeInvitation(initialTeamActionState, formData);
}

export async function setTeamMemberActiveForm(formData: FormData): Promise<void> {
  await setTeamMemberActive(initialTeamActionState, formData);
}
