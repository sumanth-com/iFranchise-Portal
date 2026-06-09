"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { requireSuperAdmin } from "@/lib/auth/session";
import { logActivity } from "@/lib/team/activity";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
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

export async function inviteAdminAccount(
  _prev: TeamActionState,
  formData: FormData,
): Promise<TeamActionState> {
  const actor = await requireSuperAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const fullName = String(formData.get("fullName") ?? "").trim() || null;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "A valid email is required.", message: null };
  }

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("email", email)
    .maybeSingle();

  if (existing?.role === "admin" || existing?.role === "super_admin") {
    return { error: "This email is already a staff account.", message: null };
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("team_invitations")
    .insert({
      email,
      team_role: "admin",
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
          team_role: "admin",
          portal_role: "admin",
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
    metadata: { email },
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

export async function revokeAdminInvitationForm(formData: FormData): Promise<void> {
  await revokeAdminInvitation(initialAdminManagementState, formData);
}

export async function setAdminAccountActiveForm(formData: FormData): Promise<void> {
  await setAdminAccountActive(initialAdminManagementState, formData);
}
