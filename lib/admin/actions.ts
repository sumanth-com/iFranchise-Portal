"use server";

import { revalidatePath } from "next/cache";

import { getAdminBrandById } from "@/lib/admin/queries";
import { brandSlugFromName } from "@/lib/utils/slug";
import {
  canApproveBrands,
  canPublishBrands,
  canReviewBrands,
} from "@/lib/admin/permissions";
import { requireAdmin } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/team/activity";
import type { AdminActionState } from "@/types/admin";
import {
  canAdminPublishBrand,
  canAdminReviewBrand,
  canAdminUnpublishBrand,
} from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

function parseFeedback(formData: FormData): string | null {
  const value = String(formData.get("adminFeedback") ?? "").trim();
  return value === "" ? null : value;
}

function revalidateAdminBrand(brandId: string, userId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/admin-management");
  revalidatePath("/admin/brands");
  revalidatePath("/admin/notifications");
  revalidatePath(`/admin/brands/${brandId}`);
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/notifications");
  if (userId) {
    revalidatePath(`/dashboard/brands/${brandId}/edit`);
    revalidatePath(`/dashboard/brands/${brandId}/preview`);
  }
}

async function updateBrandReview(
  brandId: string,
  adminId: string,
  status: BrandStatus,
  adminFeedback: string | null,
  action: string,
): Promise<AdminActionState> {
  const supabase = await createClient();
  const { data: brandRow, error: loadError } = await supabase
    .from("brands")
    .select("user_id, business_name")
    .eq("id", brandId)
    .maybeSingle();

  if (loadError || !brandRow) {
    return { error: "Brand not found.", message: null };
  }

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

  await logActivity({
    actorId: adminId,
    action,
    entityType: "brand",
    entityId: brandId,
    metadata: {
      status,
      businessName: brandRow.business_name,
      hasFeedback: Boolean(adminFeedback),
    },
  });

  revalidateAdminBrand(brandId, brandRow.user_id);
  return { error: null, message: null };
}

async function reviewBrand(
  formData: FormData,
  status: BrandStatus,
  options: {
    requireFeedback: boolean;
    successMessage: string;
    action: string;
    permissionCheck: (profile: Awaited<ReturnType<typeof requireAdmin>>) => boolean;
  },
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  if (!options.permissionCheck(admin)) {
    return {
      error: "You do not have permission to perform this action.",
      message: null,
    };
  }

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

  const result = await updateBrandReview(
    brandId,
    admin.id,
    status,
    feedback,
    options.action,
  );

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
    successMessage: "Brand approved. It is now visible to admins only until published.",
    action: "brand.approved",
    permissionCheck: canApproveBrands,
  });
}

export async function rejectBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return reviewBrand(formData, "rejected", {
    requireFeedback: true,
    successMessage: "Brand rejected. The brand owner will see your feedback.",
    action: "brand.rejected",
    permissionCheck: canReviewBrands,
  });
}

export async function requestBrandChanges(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  return reviewBrand(formData, "changes_requested", {
    requireFeedback: true,
    successMessage: "Changes requested. The brand owner can edit and resubmit.",
    action: "brand.changes_requested",
    permissionCheck: canReviewBrands,
  });
}

export async function publishBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  if (!canPublishBrands(admin)) {
    return {
      error: "You do not have permission to publish brands.",
      message: null,
    };
  }

  const brandId = String(formData.get("brandId") ?? "").trim();
  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  const { brand, error: loadError } = await getAdminBrandById(brandId);
  if (loadError) return { error: loadError, message: null };
  if (!brand) return { error: "Brand not found.", message: null };

  if (!canAdminPublishBrand(brand)) {
    return {
      error: "Only approved, unpublished brands can be published.",
      message: null,
    };
  }

  const supabase = await createClient();
  const slug = brandSlugFromName(brand.business_name, brandId);
  const publishedAt = new Date().toISOString();

  const payloads: Record<string, unknown>[] = [
    { published_at: publishedAt, slug, publish_ready: true },
    { published_at: publishedAt, publish_ready: true },
    { published_at: publishedAt },
  ];

  let lastError: string | null = null;
  for (const payload of payloads) {
    const { error } = await supabase
      .from("brands")
      .update(payload)
      .eq("id", brandId);
    if (!error) {
      lastError = null;
      break;
    }
    lastError = error.message;
  }

  if (lastError) {
    return {
      error: lastError || "Failed to publish brand.",
      message: null,
    };
  }

  revalidatePath("/franchises");
  revalidatePath(`/franchises/${slug}`);

  await logActivity({
    actorId: admin.id,
    action: "brand.published",
    entityType: "brand",
    entityId: brandId,
    metadata: { businessName: brand.business_name },
  });

  revalidateAdminBrand(brandId, brand.user_id);
  return {
    error: null,
    message: "Brand published to the public website.",
  };
}

export async function unpublishBrand(
  _prevState: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const admin = await requireAdmin();

  if (!canPublishBrands(admin)) {
    return {
      error: "You do not have permission to unpublish brands.",
      message: null,
    };
  }

  const brandId = String(formData.get("brandId") ?? "").trim();
  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  const { brand, error: loadError } = await getAdminBrandById(brandId);
  if (loadError) return { error: loadError, message: null };
  if (!brand) return { error: "Brand not found.", message: null };

  if (!canAdminUnpublishBrand(brand)) {
    return {
      error: "Only published brands can be unpublished.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      publish_ready: false,
      published_at: null,
    })
    .eq("id", brandId);

  if (error) {
    return {
      error: error.message || "Failed to unpublish brand.",
      message: null,
    };
  }

  await logActivity({
    actorId: admin.id,
    action: "brand.unpublished",
    entityType: "brand",
    entityId: brandId,
    metadata: { businessName: brand.business_name },
  });

  revalidatePath("/franchises");
  revalidateAdminBrand(brandId, brand.user_id);
  return {
    error: null,
    message: "Brand removed from the public website.",
  };
}
