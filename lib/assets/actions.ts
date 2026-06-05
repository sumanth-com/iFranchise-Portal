"use server";

import { revalidatePath } from "next/cache";

import { BRAND_ASSETS_BUCKET } from "@/lib/assets/constants";
import { getBrandAssetById } from "@/lib/assets/queries";
import {
  buildStoragePath,
  validateImageFile,
} from "@/lib/assets/validation";
import { requireClient } from "@/lib/auth/session";
import { getClientBrand } from "@/lib/brand/queries";
import { createClient } from "@/lib/supabase/server";
import type { AssetActionState } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";
import { isBrandEditable } from "@/types/brand";

function revalidateDashboard() {
  revalidatePath("/dashboard");
}

async function assertEditableBrand(brandId: string) {
  const profile = await requireClient();
  const { brand, error } = await getClientBrand(profile.id);

  if (error) {
    return { error, profile: null, brand: null };
  }

  if (!brand || brand.id !== brandId) {
    return {
      error: "Brand not found or access denied.",
      profile: null,
      brand: null,
    };
  }

  if (!isBrandEditable(brand.status)) {
    return {
      error: "Assets cannot be changed while your brand is under review.",
      profile: null,
      brand: null,
    };
  }

  return { error: null, profile, brand };
}

async function removeAssetFiles(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
  assetId: string,
) {
  await supabase.storage.from(BRAND_ASSETS_BUCKET).remove([storagePath]);
  await supabase.from("brand_assets").delete().eq("id", assetId);
}

async function uploadImageToStorage(
  supabase: Awaited<ReturnType<typeof createClient>>,
  storagePath: string,
  file: File,
) {
  const buffer = Buffer.from(await file.arrayBuffer());

  return supabase.storage.from(BRAND_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType: file.type,
    upsert: false,
  });
}

export async function uploadLogo(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const brandId = String(formData.get("brandId") ?? "").trim();
  const file = formData.get("file");

  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  if (!(file instanceof File)) {
    return { error: "Please select a logo image.", message: null };
  }

  const validationError = validateImageFile(file);
  if (validationError) {
    return { error: validationError, message: null };
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  const supabase = await createClient();
  const { data: existingLogo } = await supabase
    .from("brand_assets")
    .select("id, storage_path")
    .eq("brand_id", brandId)
    .eq("asset_type", "logo")
    .maybeSingle();

  if (existingLogo) {
    await removeAssetFiles(supabase, existingLogo.storage_path, existingLogo.id);
  }

  const storagePath = buildStoragePath(
    access.profile.id,
    brandId,
    "logo",
    file.name,
  );

  const { error: uploadError } = await uploadImageToStorage(
    supabase,
    storagePath,
    file,
  );

  if (uploadError) {
    return {
      error: uploadError.message || "Failed to upload logo. Please try again.",
      message: null,
    };
  }

  const { error: insertError } = await supabase.from("brand_assets").insert({
    brand_id: brandId,
    asset_type: "logo",
    storage_path: storagePath,
    file_name: file.name,
    mime_type: file.type,
    file_size: file.size,
  });

  if (insertError) {
    await supabase.storage.from(BRAND_ASSETS_BUCKET).remove([storagePath]);
    return {
      error: insertError.message || "Failed to save logo metadata.",
      message: null,
    };
  }

  revalidateDashboard();
  return {
    error: null,
    message: existingLogo ? "Logo replaced." : "Logo uploaded.",
  };
}

export async function uploadGalleryImages(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const brandId = String(formData.get("brandId") ?? "").trim();
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  if (files.length === 0) {
    return { error: "Please select at least one image.", message: null };
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  const supabase = await createClient();
  let uploadedCount = 0;

  for (const file of files) {
    const validationError = validateImageFile(file);
    if (validationError) {
      return { error: validationError, message: null };
    }

    const storagePath = buildStoragePath(
      access.profile.id,
      brandId,
      "gallery",
      file.name,
    );

    const { error: uploadError } = await uploadImageToStorage(
      supabase,
      storagePath,
      file,
    );

    if (uploadError) {
      return {
        error: uploadError.message || "Failed to upload gallery image.",
        message: null,
      };
    }

    const { error: insertError } = await supabase.from("brand_assets").insert({
      brand_id: brandId,
      asset_type: "gallery",
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type,
      file_size: file.size,
    });

    if (insertError) {
      await supabase.storage.from(BRAND_ASSETS_BUCKET).remove([storagePath]);
      return {
        error: insertError.message || "Failed to save gallery metadata.",
        message: null,
      };
    }

    uploadedCount += 1;
  }

  revalidateDashboard();
  return {
    error: null,
    message:
      uploadedCount === 1
        ? "Gallery image uploaded."
        : `${uploadedCount} gallery images uploaded.`,
  };
}

export async function deleteBrandAssetForm(formData: FormData) {
  await deleteBrandAsset(initialAssetActionState, formData);
}

export async function deleteBrandAsset(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const assetId = String(formData.get("assetId") ?? "").trim();

  if (!assetId) {
    return { error: "Asset ID is missing.", message: null };
  }

  const asset = await getBrandAssetById(assetId);
  if (!asset) {
    return { error: "Asset not found.", message: null };
  }

  const access = await assertEditableBrand(asset.brand_id);
  if (access.error) {
    return { error: access.error, message: null };
  }

  const supabase = await createClient();
  const { error: storageError } = await supabase.storage
    .from(BRAND_ASSETS_BUCKET)
    .remove([asset.storage_path]);

  if (storageError) {
    return {
      error: storageError.message || "Failed to delete file from storage.",
      message: null,
    };
  }

  const { error: deleteError } = await supabase
    .from("brand_assets")
    .delete()
    .eq("id", assetId);

  if (deleteError) {
    return {
      error: deleteError.message || "Failed to delete asset record.",
      message: null,
    };
  }

  revalidateDashboard();
  return {
    error: null,
    message: asset.asset_type === "logo" ? "Logo removed." : "Image removed.",
  };
}
