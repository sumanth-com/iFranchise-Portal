"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireClient } from "@/lib/auth/session";
import { getClientBrandById, getClientBrands } from "@/lib/brand/queries";
import {
  mergeBrandFormWithExisting,
  parseBrandFormData,
  toBrandRow,
  validateBrandValues,
} from "@/lib/brand/validation";
import { mapBrandSaveError } from "@/lib/brand/errors";
import {
  getMissingBrandColumns,
  insertBrandRowSafe,
  updateBrandRowSafe,
} from "@/lib/brand/schema";
import { createClientWithAccessToken } from "@/lib/supabase/authenticated-client";
import { createClient } from "@/lib/supabase/server";
import type { Brand, BrandActionState } from "@/types/brand";
import {
  canOwnerEditBrand,
  getOwnerEditBlockReason,
} from "@/lib/brand/owner-access";
import { brandEditPath, isBrandEditable, isBrandLocked } from "@/types/brand";

function revalidateBrandPaths(brandId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/brands/new");
  revalidatePath("/dashboard/onboarding");
  if (brandId) {
    revalidatePath(`/dashboard/brands/${brandId}/edit`);
    revalidatePath(`/dashboard/brands/${brandId}/preview`);
    revalidatePath(`/dashboard/brands/${brandId}/submitted`);
  }
}

function getBrandIdFromForm(formData: FormData): string | null {
  const id = formData.get("brandId");
  return typeof id === "string" && id.trim() ? id.trim() : null;
}

/** JWT-scoped client so auth.uid() is set for brands RLS on save/submit. */
async function resolveBrandRlsClient() {
  const cookieClient = await createClient();
  const {
    data: { session },
    error,
  } = await cookieClient.auth.getSession();
  if (error || !session?.access_token) {
    return { supabase: null, error: "You must be signed in to save." };
  }
  return {
    supabase: createClientWithAccessToken(session.access_token),
    error: null,
  };
}

async function getOwnedBrand(
  userId: string,
  brandId: string | null,
): Promise<Brand | null> {
  if (brandId) {
    const result = await getClientBrandById(userId, brandId);
    return result.brand;
  }
  const result = await getClientBrands(userId);
  return result.brands[0] ?? null;
}

export async function createBrand(): Promise<void> {
  const profile = await requireClient();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .insert({
      user_id: profile.id,
      business_name: "Untitled Brand",
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/dashboard/brands?error=create");
  }

  revalidateBrandPaths(data.id);
  redirect(brandEditPath(data.id));
}

export async function saveBrandDraft(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);
  const parsed = parseBrandFormData(formData);
  const rls = await resolveBrandRlsClient();
  if (!rls.supabase) {
    return { error: rls.error ?? "Not authenticated.", message: null };
  }
  const supabase = rls.supabase;
  const missingColumns = await getMissingBrandColumns(supabase);
  const existing = await getOwnedBrand(profile.id, brandId);

  const values =
    existing != null
      ? mergeBrandFormWithExisting(parsed, existing, formData)
      : parsed;

  const validationError = validateBrandValues(values, {
    requireAllForSubmit: false,
    isDraft: true,
  });

  if (validationError) {
    return { error: validationError, message: null };
  }

  if (brandId && !existing) {
    return {
      error: "Brand not found. Cannot save changes to this listing.",
      message: null,
      brandId: null,
    };
  }

  if (existing && !canOwnerEditBrand(existing)) {
    return {
      error:
        getOwnerEditBlockReason(existing) ??
        "This brand cannot be edited in its current status.",
      message: null,
    };
  }

  const row = toBrandRow(values, { isDraft: true });

  if (existing) {
    const { error } = await updateBrandRowSafe(
      supabase,
      row,
      existing.id,
      profile.id,
      missingColumns,
    );

    if (error) {
      return {
        error: mapBrandSaveError(error),
        message: null,
        brandId: existing.id,
      };
    }

    revalidateBrandPaths(existing.id);
    return {
      error: null,
      message: "Draft saved.",
      brandId: existing.id,
    };
  }

  const { id: createdId, error } = await insertBrandRowSafe(
    supabase,
    row,
    profile.id,
    missingColumns,
  );

  if (error || !createdId) {
    return {
      error: mapBrandSaveError(error),
      message: null,
      brandId: null,
    };
  }

  revalidateBrandPaths(createdId);
  return {
    error: null,
    message: "Draft saved.",
    brandId: createdId,
  };
}

export async function submitBrandForReview(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);
  const parsed = parseBrandFormData(formData);
  const rls = await resolveBrandRlsClient();
  if (!rls.supabase) {
    return { error: rls.error ?? "Not authenticated.", message: null };
  }
  const supabase = rls.supabase;
  const missingColumns = await getMissingBrandColumns(supabase);
  const existing = await getOwnedBrand(profile.id, brandId);

  const values =
    existing != null
      ? mergeBrandFormWithExisting(parsed, existing, formData)
      : parsed;

  const validationError = validateBrandValues(values, {
    requireAllForSubmit: true,
  });

  if (validationError) {
    return { error: validationError, message: null };
  }

  if (!existing) {
    return { error: "Brand not found. Save a draft first.", message: null };
  }

  if (!canOwnerEditBrand(existing)) {
    return {
      error:
        getOwnerEditBlockReason(existing) ??
        "This brand cannot be submitted in its current status.",
      message: null,
    };
  }

  const row = {
    ...toBrandRow(values),
    status: "submitted" as const,
    submitted_at: new Date().toISOString(),
  };

  const { error } = await updateBrandRowSafe(
    supabase,
    row,
    existing.id,
    profile.id,
    missingColumns,
  );

  if (error) {
    return {
      error: mapBrandSaveError(error),
      message: null,
    };
  }

  revalidateBrandPaths(existing.id);
  return {
    error: null,
    message:
      "Brand submitted for review. You will be notified when it is reviewed.",
  };
}

export async function submitBrandById(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);

  if (!brandId) {
    return { error: "Brand ID is required.", message: null };
  }

  const existing = await getOwnedBrand(profile.id, brandId);

  if (!existing) {
    return { error: "Brand not found.", message: null };
  }

  if (!isBrandEditable(existing.status)) {
    return {
      error: "This brand cannot be submitted in its current status.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", existing.id)
    .eq("user_id", profile.id);

  if (error) {
    return {
      error: mapBrandSaveError(error.message),
      message: null,
    };
  }

  revalidateBrandPaths(existing.id);
  return {
    error: null,
    message: "Brand submitted for review.",
  };
}

export async function deleteBrandById(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);

  if (!brandId) {
    return { error: "Brand ID is required.", message: null };
  }

  const existing = await getOwnedBrand(profile.id, brandId);

  if (!existing) {
    return { error: "Brand not found.", message: null };
  }

  if (existing.status === "approved") {
    return {
      error: "Approved brands cannot be deleted. Contact support.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .delete()
    .eq("id", existing.id)
    .eq("user_id", profile.id);

  if (error) {
    return { error: error.message || "Failed to delete brand.", message: null };
  }

  revalidateBrandPaths();
  return { error: null, message: "Brand deleted." };
}

export async function duplicateBrandById(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);

  if (!brandId) {
    return { error: "Brand ID is required.", message: null };
  }

  const { brand: source } = await getClientBrandById(profile.id, brandId);

  if (!source) {
    return { error: "Brand not found.", message: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .insert({
      user_id: profile.id,
      business_name: `${source.business_name} (Copy)`,
      tagline: source.tagline,
      description: source.description,
      website_url: source.website_url,
      contact_email: source.contact_email,
      contact_phone: source.contact_phone,
      industry: source.industry,
      category: source.category,
      status: "draft",
      investment_min: source.investment_min,
      investment_max: source.investment_max,
      franchise_fee: source.franchise_fee,
      space_required_sqft: source.space_required_sqft,
      roi_percent: source.roi_percent,
      payback_period_months: source.payback_period_months,
      franchise_models: source.franchise_models,
      current_outlets: source.current_outlets,
      existing_cities: source.existing_cities,
      target_cities: source.target_cities,
      expansion_tier_1: source.expansion_tier_1,
      expansion_tier_2: source.expansion_tier_2,
      expansion_metro: source.expansion_metro,
      agreement_term_years: source.agreement_term_years,
      lock_in_period_months: source.lock_in_period_months,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: "Failed to duplicate brand.", message: null };
  }

  revalidateBrandPaths(data.id);
  return {
    error: null,
    message: `Brand duplicated. Edit "${source.business_name} (Copy)" to customize.`,
  };
}

export async function requestBrandUpdate(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const brandId = getBrandIdFromForm(formData);

  if (!brandId) {
    return { error: "Brand ID is required.", message: null };
  }

  const existing = await getOwnedBrand(profile.id, brandId);

  if (!existing || !isBrandLocked(existing.status)) {
    return {
      error: "Only approved brands can request an update.",
      message: null,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
      admin_feedback: "Brand owner requested a listing update.",
    })
    .eq("id", existing.id)
    .eq("user_id", profile.id);

  if (error) {
    return { error: error.message || "Failed to request update.", message: null };
  }

  revalidateBrandPaths(existing.id);
  return {
    error: null,
    message: "Update request submitted. Your listing is under review again.",
  };
}
