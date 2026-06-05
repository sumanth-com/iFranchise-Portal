"use server";

import { revalidatePath } from "next/cache";

import { BRAND_ASSETS_BUCKET } from "@/lib/assets/constants";
import { getBrandAssetById } from "@/lib/assets/queries";
import {
  buildStoragePath,
  validateDocumentFile,
  validateImageFile,
} from "@/lib/assets/validation";
import type { AssetType } from "@/types/assets";
import { requireClient } from "@/lib/auth/session";
import { getClientBrand } from "@/lib/brand/queries";
import { createClient } from "@/lib/supabase/server";
import type { AssetActionState } from "@/types/assets";
import { initialAssetActionState } from "@/types/assets";
import { isBrandEditable } from "@/types/brand";

function revalidateDashboard() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/onboarding");
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

const VALID_UPLOAD_TYPES = new Set<AssetType>([
  "gallery",
  "store_photo",
  "product_photo",
  "document",
]);

function parseUploadAssetType(formData: FormData): AssetType {
  const raw = String(formData.get("assetType") ?? "gallery").trim();
  if (VALID_UPLOAD_TYPES.has(raw as AssetType)) {
    return raw as AssetType;
  }
  return "gallery";
}

function uploadTypeLabel(assetType: AssetType, count: number): string {
  if (assetType === "document") {
    return count === 1 ? "Document uploaded." : `${count} documents uploaded.`;
  }
  if (assetType === "store_photo") {
    return count === 1 ? "Store photo uploaded." : `${count} store photos uploaded.`;
  }
  if (assetType === "product_photo") {
    return count === 1 ? "Product photo uploaded." : `${count} product photos uploaded.`;
  }
  return count === 1 ? "Gallery image uploaded." : `${count} gallery images uploaded.`;
}

export async function uploadGalleryImages(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const brandId = String(formData.get("brandId") ?? "").trim();
  const assetType = parseUploadAssetType(formData);
  const files = formData
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!brandId) {
    return { error: "Brand ID is missing.", message: null };
  }

  if (files.length === 0) {
    return {
      error: assetType === "document"
        ? "Please select at least one PDF."
        : "Please select at least one image.",
      message: null,
    };
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return { error: access.error ?? "Access denied.", message: null };
  }

  const supabase = await createClient();
  let uploadedCount = 0;

  for (const file of files) {
    const validationError =
      assetType === "document"
        ? validateDocumentFile(file)
        : validateImageFile(file);
    if (validationError) {
      return { error: validationError, message: null };
    }

    const storagePath = buildStoragePath(
      access.profile.id,
      brandId,
      assetType,
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
      asset_type: assetType,
      storage_path: storagePath,
      file_name: file.name,
      mime_type: file.type || (assetType === "document" ? "application/pdf" : file.type),
      file_size: file.size,
    });

    if (insertError) {
      await supabase.storage.from(BRAND_ASSETS_BUCKET).remove([storagePath]);
      return {
        error: insertError.message || "Failed to save asset metadata.",
        message: null,
      };
    }

    uploadedCount += 1;
  }

  revalidateDashboard();
  return {
    error: null,
    message: uploadTypeLabel(assetType, uploadedCount),
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
  const removedLabel =
    asset.asset_type === "logo"
      ? "Logo removed."
      : asset.asset_type === "document"
        ? "Document removed."
        : "File removed.";
  return {
    error: null,
    message: removedLabel,
  };
}
