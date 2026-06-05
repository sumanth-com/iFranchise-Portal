"use server";

import { revalidatePath } from "next/cache";

import { getAdminBrandById } from "@/lib/admin/queries";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { AdminActionState } from "@/types/admin";
import { canAdminReviewBrand } from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

function parseFeedback(formData: FormData): string | null {
  const value = String(formData.get("adminFeedback") ?? "").trim();
  return value === "" ? null : value;
}

function revalidateAdminBrand(brandId: string) {
  revalidatePath("/admin");
  revalidatePath(`/admin/brands/${brandId}`);
}

async function updateBrandReview(
  brandId: string,
  adminId: string,
  status: BrandStatus,
  adminFeedback: string | null,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      status,
      admin_feedback: adminFeedback,
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminId,
    })
    .eq("id", brandId);

  if (error) {
    return {
      error: error.message || "Failed to update brand. Please try again.",
      message: null,
    };
  }

  revalidateAdminBrand(brandId);
  return { error: null, message: null };
}

async function reviewBrand(
  formData: FormData,
  status: BrandStatus,
  options: { requireFeedback: boolean; successMessage: string },
): Promise<AdminActionState> {
  const admin = await requireAdmin();
  const brandId = String(formData.get("brandId") ?? "").trim();
  const feedback = parseFeedback(formData);

  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  if (options.requireFeedback && !feedback) {
    return {
      error: "Admin feedback is required for this action.",
      message: null,
    };
  }

  const { brand, error: loadError } = await getAdminBrandById(brandId);

  if (loadError) {
    return { error: loadError, message: null };
  }

  if (!brand) {
    return { error: "Brand not found.", message: null };
  }

  if (!canAdminReviewBrand(brand.status)) {
    return {
      error: "Only submitted brands can be reviewed. Refresh the page for the latest status.",
      message: null,
    };
  }

  const result = await updateBrandReview(brandId, admin.id, status, feedback);

  if (result.error) {
    return result;
  }

  return { error: null, message: options.successMessage };
}

export async function approveBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return reviewBrand(formData, "approved", {
    requireFeedback: false,
    successMessage: "Brand approved successfully.",
  });
}

export async function rejectBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return reviewBrand(formData, "rejected", {
    requireFeedback: true,
    successMessage: "Brand rejected. The client will see your feedback.",
  });
}

export async function requestBrandChanges(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return reviewBrand(formData, "changes_requested", {
    requireFeedback: true,
    successMessage: "Changes requested. The client can edit and resubmit.",
  });
}
