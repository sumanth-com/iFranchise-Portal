"use server";

import { revalidatePath } from "next/cache";

import { isBrochureAsset, isGalleryImage } from "@/lib/assets/brochure-compat";
import { MAX_GALLERY_IMAGES } from "@/lib/assets/constants";
import { getAssetsAdminClient } from "@/lib/assets/storage-admin";
import { ASSET_SUCCESS, failUpload, mapAssetError } from "@/lib/assets/errors";
import { getBrandAssetById } from "@/lib/assets/queries";
import { logUpload, logUploadError } from "@/lib/assets/upload-log";
import {
  createSignedPreviewUrl,
  deleteAssetRow,
  getFormUploadFile,
  getFormUploadFiles,
  insertAssetRow,
  removeStorageObject,
  resolveFileMeta,
  uploadOptimizedImageToStorage,
  uploadToStorage,
  verifyStorageBucket,
  verifyStorageObjectExists,
} from "@/lib/assets/upload-pipeline";
import {
  buildStoragePath,
  buildWebpStoragePath,
  validateDocumentFile,
  validateImageFile,
} from "@/lib/assets/validation";
import type { AssetType, BrandAssetWithUrl } from "@/types/assets";
import { requireClient } from "@/lib/auth/session";
import { getClientBrandById } from "@/lib/brand/queries";
import { createClientWithAccessToken } from "@/lib/supabase/authenticated-client";
import { createClient } from "@/lib/supabase/server";
import type { AssetActionState } from "@/types/assets";
import { isBrandEditable } from "@/types/brand";
import type { SupabaseClient } from "@supabase/supabase-js";

function buildUploadedAsset(
  insertId: string,
  brandId: string,
  assetType: AssetType,
  storagePath: string,
  meta: { name: string; type: string; size: number },
  previewUrl: string | null,
): BrandAssetWithUrl {
  return {
    id: insertId,
    brand_id: brandId,
    asset_type: assetType,
    storage_path: storagePath,
    file_name: meta.name,
    mime_type: meta.type,
    file_size: meta.size,
    created_at: new Date().toISOString(),
    previewUrl,
  };
}

function revalidateDashboard(brandId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/brands/new");
  revalidatePath("/dashboard/onboarding");
  if (brandId) {
    revalidatePath(`/dashboard/brands/${brandId}/edit`);
    revalidatePath(`/dashboard/brands/${brandId}/preview`);
  }
}

const BROCHURE_UPLOAD_FAILED = "Brochure upload failed. Please try again.";

function isTruncatedUploadBody(message: string): boolean {
  const lower = message.toLowerCase();
  return lower.includes("unexpected end of form") || lower.includes("body exceeded");
}

async function guardUploadAction(
  operation: string,
  run: () => Promise<AssetActionState>,
): Promise<AssetActionState> {
  try {
    return await run();
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    logUploadError("UNHANDLED", error, { operation, raw });
    if (operation === "brochure" || isTruncatedUploadBody(raw)) {
      return failUpload(BROCHURE_UPLOAD_FAILED, raw, "FORM_PARSE");
    }
    return {
      error: mapAssetError(raw, operation),
      message: null,
      debug: raw,
    };
  }
}

type AuthContext = {
  userId: string;
  accessToken: string;
  error: null;
} | {
  userId: null;
  accessToken: null;
  error: string;
};

async function requireUploadAuth(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<AuthContext> {
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  const hasSession = Boolean(session);
  const hasAccessToken = Boolean(session?.access_token);
  const userId = user?.id ?? session?.user?.id ?? null;

  logUpload("AUTH", {
    userId,
    email: user?.email ?? session?.user?.email ?? null,
    hasSession,
    hasAccessToken,
    sessionError: sessionError?.message ?? null,
    userError: userError?.message ?? null,
  });

  if (sessionError || userError) {
    const message = userError?.message ?? sessionError?.message ?? "Not authenticated.";
    logUploadError("AUTH", userError ?? sessionError ?? new Error(message), { hasSession });
    return { userId: null, accessToken: null, error: message };
  }

  if (!userId || !hasAccessToken) {
    const message = "You must be signed in to upload files.";
    logUploadError("AUTH", new Error(message), { userId, hasSession, hasAccessToken });
    return { userId: null, accessToken: null, error: message };
  }

  return { userId, accessToken: session!.access_token, error: null };
}

type ResolvedUploadAuth = {
  supabase: SupabaseClient;
  userId: string;
};

/** JWT-scoped client so auth.uid() is set for RLS on brand_assets. */
async function resolveUploadAuth(): Promise<
  { ok: true; auth: ResolvedUploadAuth } | { ok: false; error: string }
> {
  const cookieClient = await createClient();
  const session = await requireUploadAuth(cookieClient);
  if (!session.userId || !session.accessToken) {
    return {
      ok: false,
      error: session.error ?? "You must be signed in to upload files.",
    };
  }
  return {
    ok: true,
    auth: {
      supabase: createClientWithAccessToken(session.accessToken),
      userId: session.userId,
    },
  };
}

async function assertEditableBrand(brandId: string) {
  const profile = await requireClient();
  const { brand, error } = await getClientBrandById(profile.id, brandId);

  logUpload("BRAND_ACCESS", {
    brandId,
    profileId: profile.id,
    brandFound: Boolean(brand),
    brandStatus: brand?.status ?? null,
    loadError: error,
  });

  if (error) {
    return { error, profile: null, brand: null, userId: profile.id };
  }

  if (!brand || brand.id !== brandId) {
    return {
      error: "Brand not found or access denied.",
      profile: null,
      brand: null,
      userId: profile.id,
    };
  }

  if (!isBrandEditable(brand.status)) {
    return {
      error: `Assets cannot be changed while brand status is "${brand.status}".`,
      profile: null,
      brand: null,
      userId: profile.id,
    };
  }

  return { error: null, profile, brand, userId: profile.id };
}

async function removeAssetRecord(
  storagePath: string,
  assetId: string,
  authUserId: string,
  brandId?: string,
) {
  await removeStorageObject(storagePath);
  await deleteAssetRow(assetId, authUserId, brandId);
}

async function listBrochureAssets(brandId: string) {
  const admin = getAssetsAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("brand_assets")
    .select("id, storage_path, asset_type, mime_type")
    .eq("brand_id", brandId);

  if (error) {
    logUploadError("BROCHURE_LIST", error, { brandId });
    return [];
  }

  return (data ?? []).filter(isBrochureAsset);
}

async function countGalleryImages(brandId: string) {
  const admin = getAssetsAdminClient();
  if (!admin) return 0;

  const { data, error } = await admin
    .from("brand_assets")
    .select("id, asset_type, mime_type, storage_path")
    .eq("brand_id", brandId)
    .eq("asset_type", "gallery");

  if (error) {
    logUploadError("GALLERY_COUNT", error, { brandId });
    return 0;
  }

  return (data ?? []).filter(isGalleryImage).length;
}

export async function uploadLogo(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  return guardUploadAction("logo", () => uploadLogoImpl(_prevState, formData));
}

async function uploadLogoImpl(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  logUpload("START", { operation: "logo" });

  const brandId = String(formData.get("brandId") ?? "").trim();
  if (!brandId) {
    return failUpload(
      "Save your brand draft first, then upload assets.",
      "Missing brandId in FormData",
      "VALIDATION",
    );
  }

  const file = getFormUploadFile(formData, "file");
  if (!file) {
    return failUpload(
      "Please select a logo image.",
      "No file in FormData (field: file)",
      "VALIDATION",
    );
  }

  const meta = resolveFileMeta(file, "logo.jpg");
  const validationError = validateImageFile(
    file instanceof File ? file : new File([file], meta.name, { type: meta.type }),
  );
  if (validationError) {
    return failUpload(validationError, `Client validation: ${validationError}`, "VALIDATION");
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return failUpload(
      mapAssetError(access.error, "brand-access"),
      access.error ?? "Brand access denied",
      "BRAND_ACCESS",
    );
  }

  const uploadAuth = await resolveUploadAuth();
  if (!uploadAuth.ok) {
    return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
  }
  const { supabase, userId: authUserId } = uploadAuth.auth;

  const bucketCheck = await verifyStorageBucket();
  if (!bucketCheck.ok) {
    return failUpload(
      mapAssetError(bucketCheck.error, "bucket-verify"),
      bucketCheck.error,
      "BUCKET_VERIFY",
    );
  }

  const { data: existingLogo } = await supabase
    .from("brand_assets")
    .select("id, storage_path")
    .eq("brand_id", brandId)
    .eq("asset_type", "logo")
    .maybeSingle();

  if (existingLogo) {
    logUpload("REPLACE", { existingAssetId: existingLogo.id, path: existingLogo.storage_path });
    await removeAssetRecord(
      existingLogo.storage_path,
      existingLogo.id,
      authUserId,
      brandId,
    );
  }

  const storagePath = buildWebpStoragePath(authUserId, brandId, "logo");

  logUpload("UPLOAD_READY", {
    userId: authUserId,
    brandId,
    bucket: "brand-assets",
    fileName: meta.name,
    fileSize: meta.size,
    storagePath,
    assetType: "logo",
    optimize: "webp",
  });

  const upload = await uploadOptimizedImageToStorage(storagePath, file, {
    maxWidth: 800,
    maxHeight: 800,
    quality: 85,
  });
  if (!upload.ok) {
    const msg = upload.error ?? "Unknown storage error";
    return {
      error: mapAssetError(msg, "storage-upload"),
      message: null,
      debug: msg,
    };
  }

  const insert = await insertAssetRow(
    {
      brand_id: brandId,
      asset_type: "logo",
      storage_path: storagePath,
      file_name: meta.name,
      mime_type: upload.optimized.mimeType,
      file_size: upload.optimized.sizeBytes,
    },
    authUserId,
  );

  if (!insert.ok) {
    await removeStorageObject(storagePath);
    const msg = insert.error ?? "Unknown database error";
    return {
      error: mapAssetError(msg, "database-insert"),
      message: null,
      debug: msg,
    };
  }

  const signed = await createSignedPreviewUrl(storagePath);

  revalidateDashboard(brandId);
  logUpload("COMPLETE", { operation: "logo", assetId: insert.id, storagePath });

  return {
    error: null,
    message: existingLogo ? ASSET_SUCCESS.logoReplaced : ASSET_SUCCESS.logoUploaded,
    debug: null,
    uploadedAsset: insert.id
      ? buildUploadedAsset(
          insert.id,
          brandId,
          "logo",
          storagePath,
          {
            name: meta.name,
            type: upload.optimized.mimeType,
            size: upload.optimized.sizeBytes,
          },
          signed.url,
        )
      : null,
  };
}

export async function uploadGalleryImages(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  return guardUploadAction("gallery", () => uploadGalleryImagesImpl(_prevState, formData));
}

async function uploadGalleryImagesImpl(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  logUpload("START", { operation: "gallery" });

  const brandId = String(formData.get("brandId") ?? "").trim();
  if (!brandId) {
    return failUpload(
      "Save your brand draft first, then upload assets.",
      "Missing brandId",
      "VALIDATION",
    );
  }

  const files = getFormUploadFiles(formData, "files");
  if (files.length === 0) {
    return failUpload(
      "Please select at least one image.",
      "No files in FormData (field: files)",
      "VALIDATION",
    );
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return failUpload(
      mapAssetError(access.error, "brand-access"),
      access.error ?? "Brand access denied",
      "BRAND_ACCESS",
    );
  }

  const uploadAuth = await resolveUploadAuth();
  if (!uploadAuth.ok) {
    return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
  }
  const { supabase, userId: authUserId } = uploadAuth.auth;

  const bucketCheck = await verifyStorageBucket();
  if (!bucketCheck.ok) {
    return failUpload(
      mapAssetError(bucketCheck.error, "bucket-verify"),
      bucketCheck.error,
      "BUCKET_VERIFY",
    );
  }

  const current = await countGalleryImages(brandId);
  if (current + files.length > MAX_GALLERY_IMAGES) {
    return failUpload(
      `Maximum ${MAX_GALLERY_IMAGES} gallery images allowed.`,
      `Would exceed limit: ${current} + ${files.length}`,
      "VALIDATION",
    );
  }

  let uploadedCount = 0;
  const uploadedAssets: BrandAssetWithUrl[] = [];

  for (const file of files) {
    const meta = resolveFileMeta(file, `gallery-${uploadedCount}.jpg`);
    const validationError = validateImageFile(
      file instanceof File ? file : new File([file], meta.name, { type: meta.type }),
    );
    if (validationError) {
      return failUpload(validationError, validationError, "VALIDATION");
    }

    const storagePath = buildWebpStoragePath(authUserId, brandId, "gallery");
    const upload = await uploadOptimizedImageToStorage(storagePath, file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 82,
    });

    if (!upload.ok) {
      const msg = upload.error ?? "Unknown storage error";
      return { error: mapAssetError(msg, "storage-upload"), message: null, debug: msg };
    }

    const insert = await insertAssetRow(
      {
        brand_id: brandId,
        asset_type: "gallery",
        storage_path: storagePath,
        file_name: meta.name,
        mime_type: upload.optimized.mimeType,
        file_size: upload.optimized.sizeBytes,
      },
      authUserId,
    );

    if (!insert.ok) {
      await removeStorageObject(storagePath);
      const msg = insert.error ?? "Unknown database error";
      return { error: mapAssetError(msg, "database-insert"), message: null, debug: msg };
    }

    const signed = await createSignedPreviewUrl(storagePath);
    if (insert.id) {
      uploadedAssets.push(
        buildUploadedAsset(insert.id, brandId, "gallery", storagePath, {
          name: meta.name,
          type: upload.optimized.mimeType,
          size: upload.optimized.sizeBytes,
        }, signed.url),
      );
    }

    uploadedCount += 1;
  }

  revalidateDashboard(brandId);
  logUpload("COMPLETE", { operation: "gallery", count: uploadedCount });

  return {
    error: null,
    message:
      uploadedCount === 1
        ? ASSET_SUCCESS.galleryUploaded
        : `✓ ${uploadedCount} gallery images uploaded`,
    debug: null,
    uploadedAssets,
  };
}

export type PrepareBrochureUploadResult = {
  error: string | null;
  storagePath: string | null;
  replaced: boolean;
};

/** Lightweight server action — no file bytes. Returns storage path for direct client upload. */
export async function prepareBrochureUpload(
  brandId: string,
  fileName: string,
  fileSize: number,
): Promise<PrepareBrochureUploadResult> {
  try {
    logUpload("PREPARE_BROCHURE", { brandId, fileName, fileSize });

    if (!brandId?.trim()) {
      return { error: "Save your brand draft first, then upload assets.", storagePath: null, replaced: false };
    }

    const pseudoFile = new File([new Uint8Array(Math.min(fileSize, 1))], fileName, {
      type: "application/pdf",
    });
    Object.defineProperty(pseudoFile, "size", { value: fileSize });
    const validationError = validateDocumentFile(pseudoFile);
    if (validationError) {
      return { error: validationError, storagePath: null, replaced: false };
    }

    const access = await assertEditableBrand(brandId);
    if (access.error || !access.profile) {
      return {
        error: mapAssetError(access.error, "brand-access"),
        storagePath: null,
        replaced: false,
      };
    }

    const uploadAuth = await resolveUploadAuth();
    if (!uploadAuth.ok) {
      return {
        error: uploadAuth.error,
        storagePath: null,
        replaced: false,
      };
    }
    const { supabase, userId: authUserId } = uploadAuth.auth;

    const bucketCheck = await verifyStorageBucket();
    if (!bucketCheck.ok) {
      return {
        error: mapAssetError(bucketCheck.error, "bucket-verify"),
        storagePath: null,
        replaced: false,
      };
    }

    const existingDocs = await listBrochureAssets(brandId);

    const replaced = existingDocs.length > 0;
    for (const doc of existingDocs) {
      await removeAssetRecord(doc.storage_path, doc.id, authUserId, brandId);
    }

    const storagePath = buildStoragePath(authUserId, brandId, "document", fileName);

    logUpload("PREPARE_BROCHURE_OK", { brandId, storagePath, replaced });

    return { error: null, storagePath, replaced };
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    logUploadError("PREPARE_BROCHURE", error, { brandId, raw });
    return {
      error: mapAssetError(raw, "prepare-brochure"),
      storagePath: null,
      replaced: false,
    };
  }
}

/** Called after direct client upload — saves metadata only. */
export async function finalizeBrochureUpload(
  brandId: string,
  storagePath: string,
  fileName: string,
  fileSize: number,
): Promise<AssetActionState> {
  return guardUploadAction("brochure", async () => {
    logUpload("FINALIZE_BROCHURE", { brandId, storagePath, fileName, fileSize });

    if (!brandId?.trim() || !storagePath?.trim()) {
      return failUpload("Invalid upload session. Please try again.", "Missing ids", "VALIDATION");
    }

    const access = await assertEditableBrand(brandId);
    if (access.error || !access.profile) {
      return failUpload(
        mapAssetError(access.error, "brand-access"),
        access.error ?? "Brand access denied",
        "BRAND_ACCESS",
      );
    }

    const uploadAuth = await resolveUploadAuth();
    if (!uploadAuth.ok) {
      return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
    }
    const { supabase, userId: authUserId } = uploadAuth.auth;

    if (!storagePath.startsWith(`${authUserId}/`)) {
      return failUpload("Invalid storage path.", "Path ownership mismatch", "VALIDATION");
    }

    const exists = await verifyStorageObjectExists(storagePath);
    if (!exists) {
      return failUpload(
        "Brochure upload failed. Please try again.",
        "Storage object not found after client upload",
        "STORAGE_VERIFY",
      );
    }

    const insert = await insertAssetRow(
      {
        brand_id: brandId,
        asset_type: "document",
        storage_path: storagePath,
        file_name: fileName,
        mime_type: "application/pdf",
        file_size: fileSize,
      },
      authUserId,
    );

    if (!insert.ok) {
      await removeStorageObject(storagePath);
      const msg = insert.error ?? "Unknown database error";
      return { error: mapAssetError(msg, "database-insert"), message: null, debug: msg };
    }

    const signed = await createSignedPreviewUrl(storagePath);
    revalidateDashboard(brandId);
    logUpload("COMPLETE", { operation: "brochure-direct", assetId: insert.id, storagePath });

    return {
      error: null,
      message: ASSET_SUCCESS.brochureUploaded,
      debug: null,
      uploadedAsset: insert.id
        ? buildUploadedAsset(
            insert.id,
            brandId,
            "document",
            storagePath,
            { name: fileName, type: "application/pdf", size: fileSize },
            signed.url,
          )
        : null,
    };
  });
}

export async function uploadBrochure(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  return guardUploadAction("brochure", () => uploadBrochureImpl(_prevState, formData));
}

async function uploadBrochureImpl(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  logUpload("START", { operation: "brochure" });

  const brandId = String(formData.get("brandId") ?? "").trim();
  if (!brandId) {
    return failUpload(
      "Save your brand draft first, then upload assets.",
      "Missing brandId",
      "VALIDATION",
    );
  }

  const file = getFormUploadFile(formData, "file");
  if (!file) {
    return failUpload(
      "Please select a PDF brochure.",
      "No file in FormData (field: file)",
      "VALIDATION",
    );
  }

  const meta = resolveFileMeta(file, "brochure.pdf");
  logUpload("BROCHURE_FILE", {
    fileName: meta.name,
    fileSize: meta.size,
    mimeType: meta.type,
    brandId,
  });

  const validationError = validateDocumentFile(
    file instanceof File ? file : new File([file], meta.name, { type: meta.type }),
  );
  if (validationError) {
    return failUpload(validationError, validationError, "VALIDATION");
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return failUpload(
      mapAssetError(access.error, "brand-access"),
      access.error ?? "Brand access denied",
      "BRAND_ACCESS",
    );
  }

  const uploadAuth = await resolveUploadAuth();
  if (!uploadAuth.ok) {
    return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
  }
  const { supabase, userId: authUserId } = uploadAuth.auth;

  const bucketCheck = await verifyStorageBucket();
  if (!bucketCheck.ok) {
    return failUpload(
      mapAssetError(bucketCheck.error, "bucket-verify"),
      bucketCheck.error,
      "BUCKET_VERIFY",
    );
  }

  const existingDocs = await listBrochureAssets(brandId);

  for (const doc of existingDocs) {
    await removeAssetRecord(doc.storage_path, doc.id, authUserId, brandId);
  }

  const storagePath = buildStoragePath(authUserId, brandId, "document", meta.name);

  logUpload("UPLOAD_READY", {
    userId: authUserId,
    brandId,
    bucket: "brand-assets",
    fileName: meta.name,
    fileSize: meta.size,
    mimeType: "application/pdf",
    storagePath,
    assetType: "document",
  });

  const upload = await uploadToStorage(storagePath, file, "application/pdf");

  if (!upload.ok) {
    const msg = upload.error ?? "Unknown storage error";
    return { error: mapAssetError(msg, "storage-upload"), message: null, debug: msg };
  }

  const insert = await insertAssetRow(
    {
      brand_id: brandId,
      asset_type: "document",
      storage_path: storagePath,
      file_name: meta.name,
      mime_type: "application/pdf",
      file_size: meta.size,
    },
    authUserId,
  );

  if (!insert.ok) {
    await removeStorageObject(storagePath);
    const msg = insert.error ?? "Unknown database error";
    return { error: mapAssetError(msg, "database-insert"), message: null, debug: msg };
  }

  const signed = await createSignedPreviewUrl(storagePath);

  revalidateDashboard(brandId);
  logUpload("COMPLETE", { operation: "brochure", assetId: insert.id, storagePath });

  return {
    error: null,
    message:
      existingDocs.length > 0
        ? ASSET_SUCCESS.brochureReplaced
        : ASSET_SUCCESS.brochureUploaded,
    debug: null,
    uploadedAsset: insert.id
      ? buildUploadedAsset(
          insert.id,
          brandId,
          "document",
          storagePath,
          { name: meta.name, type: "application/pdf", size: meta.size },
          signed.url,
        )
      : null,
  };
}

export async function deleteBrandAsset(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  logUpload("START", { operation: "delete" });

  const assetId = String(formData.get("assetId") ?? "").trim();
  if (!assetId) {
    return failUpload("Asset ID is missing.", "Missing assetId", "VALIDATION");
  }

  const asset = await getBrandAssetById(assetId);
  if (!asset) {
    return failUpload("File not found.", `Asset ${assetId} not found`, "VALIDATION");
  }

  const access = await assertEditableBrand(asset.brand_id);
  if (access.error) {
    return failUpload(
      mapAssetError(access.error, "brand-access"),
      access.error ?? "Access denied",
      "BRAND_ACCESS",
    );
  }

  const uploadAuth = await resolveUploadAuth();
  if (!uploadAuth.ok) {
    return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
  }
  const { supabase, userId: authUserId } = uploadAuth.auth;

  await removeAssetRecord(
    asset.storage_path,
    assetId,
    authUserId,
    asset.brand_id,
  );

  revalidateDashboard(asset.brand_id);
  const removedLabel =
    asset.asset_type === "logo"
      ? ASSET_SUCCESS.logoRemoved
      : isBrochureAsset(asset)
        ? ASSET_SUCCESS.brochureRemoved
        : ASSET_SUCCESS.galleryRemoved;

  logUpload("COMPLETE", { operation: "delete", assetId });
  return { error: null, message: removedLabel, debug: null };
}

export async function deleteBrandAssetForm(formData: FormData) {
  await deleteBrandAsset({ error: null, message: null }, formData);
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
    return count === 1 ? ASSET_SUCCESS.brochureUploaded : `${count} documents uploaded.`;
  }
  return count === 1 ? ASSET_SUCCESS.galleryUploaded : `✓ ${count} images uploaded`;
}

/** Legacy upload with assetType param — used outside the marketplace assets step */
export async function uploadGalleryImagesLegacy(
  _prevState: AssetActionState,
  formData: FormData,
): Promise<AssetActionState> {
  const assetType = parseUploadAssetType(formData);
  if (assetType === "gallery") {
    return uploadGalleryImages(_prevState, formData);
  }
  if (assetType === "document") {
    const file = formData.getAll("files")[0];
    if (file instanceof Blob && file.size > 0) {
      const single = new FormData();
      single.set("brandId", String(formData.get("brandId") ?? ""));
      single.set("file", file);
      return uploadBrochure(_prevState, single);
    }
  }

  const brandId = String(formData.get("brandId") ?? "").trim();
  const files = getFormUploadFiles(formData, "files");

  if (!brandId || files.length === 0) {
    return failUpload("Please select at least one file.", "Missing brandId or files", "VALIDATION");
  }

  const access = await assertEditableBrand(brandId);
  if (access.error || !access.profile) {
    return failUpload(
      mapAssetError(access.error, "brand-access"),
      access.error ?? "Access denied",
      "BRAND_ACCESS",
    );
  }

  const uploadAuth = await resolveUploadAuth();
  if (!uploadAuth.ok) {
    return failUpload(uploadAuth.error, uploadAuth.error, "AUTH");
  }
  const { supabase, userId: authUserId } = uploadAuth.auth;

  let uploadedCount = 0;

  for (const file of files) {
    const meta = resolveFileMeta(file, `file-${uploadedCount}.jpg`);
    const validationError = validateImageFile(
      file instanceof File ? file : new File([file], meta.name, { type: meta.type }),
    );
    if (validationError) return failUpload(validationError, validationError, "VALIDATION");

    const storagePath = buildWebpStoragePath(authUserId, brandId, assetType);
    const upload = await uploadOptimizedImageToStorage(storagePath, file, {
      maxWidth: 1920,
      maxHeight: 1920,
      quality: 82,
    });
    if (!upload.ok) {
      const msg = upload.error ?? "Storage error";
      return { error: mapAssetError(msg, "storage-upload"), message: null, debug: msg };
    }

    const insert = await insertAssetRow(
      {
        brand_id: brandId,
        asset_type: assetType,
        storage_path: storagePath,
        file_name: meta.name,
        mime_type: upload.optimized.mimeType,
        file_size: upload.optimized.sizeBytes,
      },
      authUserId,
    );

    if (!insert.ok) {
      await removeStorageObject(storagePath);
      const msg = insert.error ?? "Database error";
      return { error: mapAssetError(msg, "database-insert"), message: null, debug: msg };
    }
    uploadedCount += 1;
  }

  revalidateDashboard(brandId);
  return { error: null, message: uploadTypeLabel(assetType, uploadedCount), debug: null };
}
