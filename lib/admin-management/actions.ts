"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import {
  adminRoleToPortalRole,
  adminRoleToTeamRole,
} from "@/lib/admin-management/permissions-display";
import { requireSuperAdmin } from "@/lib/auth/session";
import { logActivity } from "@/lib/team/activity";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { AdminDisplayRole } from "@/types/admin-command-center";
import type { TeamActionState } from "@/types/team";
import { initialTeamActionState } from "@/types/team";

function revalidateAdminManagement() {
  revalidatePath("/admin/admin-management");
  revalidatePath("/admin/team");
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

function parseAdminRole(value: string): AdminDisplayRole | null {
  if (value === "admin" || value === "senior_admin" || value === "super_admin") {
    return value;
  }
  return null;
}

export async function inviteAdminAccount(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const adminRole = parseAdminRole(String(formData.get("adminRole") ?? "admin"));

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email is required.", message: null };
  }

  if (!adminRole) {
    return { error: "A valid administrator role is required.", message: null };
  }

  const teamRole = adminRoleToTeamRole(adminRole);
  const portalRole = adminRoleToPortalRole(adminRole);

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (existing?.role === "admin" || existing?.role === "super_admin") {
    return { error: "This email is already a staff account.", message: null };
  }

  const { data: pendingInvite } = await supabase
    .from("team_invitations")
    .select("id")
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (pendingInvite) {
    return {
      error: "A pending invitation already exists for this email.",
      message: null,
    };
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("team_invitations")
    .insert({
      email,
      team_role: teamRole,
      invited_by: actor.id,
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
          phone,
          team_role: teamRole,
          portal_role: portalRole,
          admin_role: adminRole,
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
    actorId: actor.id,
    action: "admin.invited",
    entityType: "invitation",
    entityId: invitation.id,
    metadata: { email, admin_role: adminRole, team_role: teamRole },
  });

  revalidateAdminManagement();

  return {
    error: null,
    message: serviceClient
      ? `Invitation sent to ${email}. They will set their own password via email.`
      : `Invitation created for ${email}. Configure SUPABASE_SERVICE_ROLE_KEY to send invite emails.`,
  };
}

export async function updateAdminAccount(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const fullName = String(formData.get("fullName") ?? "").trim() || null;

  if (!memberId) {
    return { error: "Account ID is required.", message: null };
  }

  if (memberId === actor.id) {
    return { error: "Use profile settings to edit your own account.", message: null };
  }

  const supabase = await createClient();
  const { data: target } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", memberId)
    .maybeSingle();

  if (!target || (target.role !== "admin" && target.role !== "super_admin")) {
    return { error: "Admin account not found.", message: null };
  }

  if (target.role === "super_admin") {
    return { error: "Super admin accounts cannot be edited here.", message: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", memberId);

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: actor.id,
    action: "admin.updated",
    entityType: "profile",
    entityId: memberId,
    metadata: { email: target.email, full_name: fullName },
  });

  revalidateAdminManagement();
  return { error: null, message: "Admin account updated." };
}

export async function setAdminAccountActive(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const isActive = String(formData.get("isActive") ?? "") === "true";

  if (!memberId) {
    return { error: "Account ID is required.", message: null };
  }

  if (memberId === actor.id && !isActive) {
    return { error: "You cannot deactivate your own account.", message: null };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || member.role === "super_admin") {
    return { error: "Only admin accounts can be deactivated here.", message: null };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      is_active: isActive,
      disabled_at: isActive ? null : new Date().toISOString(),
      disabled_by: isActive ? null : actor.id,
    })
    .eq("id", memberId);

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: actor.id,
    action: isActive ? "admin.enabled" : "admin.disabled",
    entityType: "profile",
    entityId: memberId,
    metadata: { email: member.email },
  });

  revalidateAdminManagement();
  return {
    error: null,
    message: isActive ? "Admin account re-enabled." : "Admin account deactivated.",
  };
}

export async function sendAdminPasswordReset(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const memberId = String(formData.get("memberId") ?? "").trim();
  if (!memberId) {
    return { error: "Account ID is required.", message: null };
  }

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, role")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || member.role !== "admin") {
    return { error: "Only admin accounts can receive password resets.", message: null };
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return {
      error: "Password reset requires SUPABASE_SERVICE_ROLE_KEY.",
      message: null,
    };
  }

  const origin = await getOrigin();
  const { error } = await serviceClient.auth.resetPasswordForEmail(member.email, {
    redirectTo: `${origin}/auth/callback?next=/login`,
  });

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: actor.id,
    action: "admin.password_reset_sent",
    entityType: "profile",
    entityId: memberId,
    metadata: { email: member.email },
  });

  return {
    error: null,
    message: `Password reset email sent to ${member.email}.`,
  };
}

export async function changeAdminRole(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const memberId = String(formData.get("memberId") ?? "").trim();
  const adminRole = parseAdminRole(String(formData.get("adminRole") ?? ""));

  if (!memberId || !adminRole) {
    return { error: "Member and role are required.", message: null };
  }

  if (memberId === actor.id) {
    return { error: "You cannot change your own role here.", message: null };
  }

  const teamRole = adminRoleToTeamRole(adminRole);
  const portalRole = adminRoleToPortalRole(adminRole);

  const supabase = await createClient();
  const { data: member } = await supabase
    .from("profiles")
    .select("email, role, team_role")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || (member.role !== "admin" && member.role !== "super_admin")) {
    return { error: "Admin account not found.", message: null };
  }

  if (member.role === "super_admin" && adminRole !== "super_admin") {
    return {
      error: "Super admin accounts cannot be downgraded from this screen.",
      message: null,
    };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ team_role: teamRole, role: portalRole })
    .eq("id", memberId);

  if (error) {
    return { error: error.message, message: null };
  }

  await logActivity({
    actorId: actor.id,
    action: "admin.role_changed",
    entityType: "profile",
    entityId: memberId,
    metadata: {
      email: member.email,
      from: member.team_role,
      to: teamRole,
      admin_role: adminRole,
    },
  });

  revalidateAdminManagement();
  return { error: null, message: "Administrator role updated." };
}

export async function resendAdminInvitation(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();
  const invitationId = String(formData.get("invitationId") ?? "").trim();

  if (!invitationId) {
    return { error: "Invitation ID is required.", message: null };
  }

  const supabase = await createClient();
  const { data: invitation } = await supabase
    .from("team_invitations")
    .select("id, email, team_role, status")
    .eq("id", invitationId)
    .maybeSingle();

  if (!invitation || invitation.status !== "pending") {
    return { error: "Pending invitation not found.", message: null };
  }

  const serviceClient = createServiceClient();
  if (!serviceClient) {
    return {
      error: "Resend requires SUPABASE_SERVICE_ROLE_KEY.",
      message: null,
    };
  }

  const portalRole =
    invitation.team_role === "super_admin" ? "super_admin" : "admin";
  const origin = await getOrigin();

  const { error: authError } = await serviceClient.auth.admin.inviteUserByEmail(
    invitation.email,
    {
      data: {
        team_role: invitation.team_role,
        portal_role: portalRole,
        invitation_id: invitation.id,
      },
      redirectTo: `${origin}/auth/callback?next=/admin`,
    },
  );

  if (authError) {
    return { error: authError.message, message: null };
  }

  await supabase
    .from("team_invitations")
    .update({
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  await logActivity({
    actorId: actor.id,
    action: "admin.invitation_resent",
    entityType: "invitation",
    entityId: invitation.id,
    metadata: { email: invitation.email },
  });

  revalidateAdminManagement();
  return {
    error: null,
    message: `Invitation resent to ${invitation.email}.`,
  };
}

export async function revokeAdminInvitation(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();
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
    actorId: actor.id,
    action: "admin.invitation_revoked",
    entityType: "invitation",
    entityId: invitationId,
  });

  revalidateAdminManagement();
  return { error: null, message: "Invitation revoked." };
}

export const initialAdminManagementState = initialTeamActionState;

export async function dispatchAdminDirectoryAction(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const intent = String(formData.get("intent") ?? "");

  switch (intent) {
    case "suspend":
    case "activate":
      return setAdminAccountActive(_prev, formData);
    case "remove-invite":
      return revokeAdminInvitation(_prev, formData);
    case "remove-admin":
      formData.set("isActive", "false");
      return setAdminAccountActive(_prev, formData);
    case "resend":
      return resendAdminInvitation(_prev, formData);
    case "edit":
      return updateAdminAccount(_prev, formData);
    case "role":
      return changeAdminRole(_prev, formData);
    case "reset":
      return sendAdminPasswordReset(_prev, formData);
    default:
      return { error: "Unknown action.", message: null };
  }
}

export async function revokeAdminInvitationForm(formData: FormData): Promise<void> {
  await revokeAdminInvitation(initialAdminManagementState, formData);
}

export async function setAdminAccountActiveForm(formData: FormData): Promise<void> {
  await setAdminAccountActive(initialAdminManagementState, formData);
}
