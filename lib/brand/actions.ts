"use server";

import { revalidatePath } from "next/cache";

import { requireClient } from "@/lib/auth/session";
import { getClientBrand } from "@/lib/brand/queries";
import {
  parseBrandFormData,
  toBrandRow,
  validateBrandValues,
} from "@/lib/brand/validation";
import { createClient } from "@/lib/supabase/server";
import type { Brand, BrandActionState } from "@/types/brand";
import { isBrandEditable } from "@/types/brand";

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");
}

async function getOwnedBrand(userId: string): Promise<Brand | null> {
  const result = await getClientBrand(userId);
  return result.brand;
}

export async function saveBrandDraft(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const values = parseBrandFormData(formData);
  const validationError = validateBrandValues(values, {
    requireAllForSubmit: false,
  });

  if (validationError) {
    return { error: validationError, message: null };
  }

  const supabase = await createClient();
  const existing = await getOwnedBrand(profile.id);

  if (existing && !isBrandEditable(existing.status)) {
    return {
      error: "This brand profile can no longer be edited.",
      message: null,
    };
  }

  const row = toBrandRow(values);

  if (existing) {
    const { error } = await supabase
      .from("brands")
      .update(row)
      .eq("id", existing.id)
      .eq("user_id", profile.id);

    if (error) {
      return {
        error: error.message || "Failed to save draft. Please try again.",
        message: null,
      };
    }
  } else {
    const { error } = await supabase.from("brands").insert({
      user_id: profile.id,
      status: "draft",
      ...row,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          error: "You already have a brand profile. Refresh the page.",
          message: null,
        };
      }
      return {
        error: error.message || "Failed to create brand profile. Please try again.",
        message: null,
      };
    }
  }

  revalidateDashboard();
  return {
    error: null,
    message: existing ? "Draft saved." : "Brand profile created as draft.",
  };
}

export async function submitBrandForReview(
  _prevState: BrandActionState,
  formData: FormData,
): Promise<BrandActionState> {
  const profile = await requireClient();
  const values = parseBrandFormData(formData);
  const validationError = validateBrandValues(values, {
    requireAllForSubmit: true,
  });

  if (validationError) {
    return { error: validationError, message: null };
  }

  const supabase = await createClient();
  const existing = await getOwnedBrand(profile.id);

  if (existing && !isBrandEditable(existing.status)) {
    return {
      error: "This brand has already been submitted and cannot be edited.",
      message: null,
    };
  }

  const row = {
    ...toBrandRow(values),
    status: "submitted" as const,
    submitted_at: new Date().toISOString(),
  };

  if (existing) {
    const { error } = await supabase
      .from("brands")
      .update(row)
      .eq("id", existing.id)
      .eq("user_id", profile.id);

    if (error) {
      return {
        error: error.message || "Failed to submit for review. Please try again.",
        message: null,
      };
    }
  } else {
    const { error } = await supabase.from("brands").insert({
      user_id: profile.id,
      ...row,
    });

    if (error) {
      if (error.code === "23505") {
        return {
          error: "You already have a brand profile. Refresh the page.",
          message: null,
        };
      }
      return {
        error: error.message || "Failed to submit for review. Please try again.",
        message: null,
      };
    }
  }

  revalidateDashboard();
  return {
    error: null,
    message:
      "Brand profile submitted for review. You will be notified when it is reviewed.",
  };
}
