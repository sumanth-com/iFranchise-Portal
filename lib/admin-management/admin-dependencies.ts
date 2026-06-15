import { createClient } from "@/lib/supabase/server";

export type AdminDependencyCounts = {
  assignedLeads: number;
  reviewedBrands: number;
  openTasks: number;
};

export type AdminDependencies = AdminDependencyCounts & {
  hasDependencies: boolean;
};

export async function getAdminDependencies(
  adminId: string,
): Promise<AdminDependencies> {
  const supabase = await createClient();

  const brandsResult = await supabase
    .from("brands")
    .select("id", { count: "exact", head: true })
    .eq("reviewed_by", adminId);

  let assignedLeads = 0;
  const leadsResult = await supabase
    .from("leads")
    .select("id", { count: "exact", head: true })
    .eq("assigned_admin_id", adminId);

  if (!leadsResult.error) {
    assignedLeads = leadsResult.count ?? 0;
  }

  const reviewedBrands = brandsResult.count ?? 0;
  const openTasks = 0;

  return {
    assignedLeads,
    reviewedBrands,
    openTasks,
    hasDependencies: assignedLeads + reviewedBrands + openTasks > 0,
  };
}

export async function transferAdminOwnership(
  fromAdminId: string,
  toAdminId: string,
): Promise<{ error: string | null }> {
  if (fromAdminId === toAdminId) {
    return { error: "Choose a different administrator for transfer." };
  }

  const supabase = await createClient();

  const { error: brandsError } = await supabase
    .from("brands")
    .update({ reviewed_by: toAdminId })
    .eq("reviewed_by", fromAdminId);

  if (brandsError) {
    return { error: brandsError.message };
  }

  const { error: leadsError } = await supabase
    .from("leads")
    .update({ assigned_admin_id: toAdminId })
    .eq("assigned_admin_id", fromAdminId);

  if (leadsError && !leadsError.message.includes("leads")) {
    return { error: leadsError.message };
  }

  return { error: null };
}
