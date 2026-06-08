import {
  brochureStorageAssetType,
  isDocumentEnumError,
} from "@/lib/assets/brochure-compat";
import { BRAND_ASSETS_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from "@/lib/assets/constants";
import {
  isOptimizableImageMime,
  optimizeImageToWebp,
  type OptimizedImage,
} from "@/lib/assets/image-optimize";
import { getAssetsAdminClient } from "@/lib/assets/storage-admin";
import { logUpload, logUploadError } from "@/lib/assets/upload-log";
import type { AssetType } from "@/types/assets";

function logRlsFailure(
  operation: "INSERT" | "UPDATE" | "DELETE",
  table: string,
  authUserId: string,
  brandId: string | null,
  payload: Record<string, unknown>,
  error: { message?: string; code?: string; details?: string; hint?: string },
) {
  logUploadError("RLS_VIOLATION", new Error(error.message ?? "RLS policy violation"), {
    table,
    operation,
    authUserId,
    brandId,
    payload,
    code: error.code ?? null,
    details: error.details ?? null,
    hint: error.hint ?? null,
  });
}
export type UploadBlob = Blob & { name?: string; type?: string };

export function getFormUploadFile(
  formData: FormData,
  key: string,
): UploadBlob | null {
  const entry = formData.get(key);
  if (entry instanceof Blob && entry.size > 0) {
    logUpload("FILE_SELECTED", {
      field: key,
      name: entry instanceof File ? entry.name : "unknown",
      type: entry.type || "unknown",
      sizeBytes: entry.size,
      isFileInstance: entry instanceof File,
    });
    return entry;
  }

  logUpload("FILE_SELECTED", {
    field: key,
    error: "No valid file in FormData",
    rawType: entry === null ? "null" : typeof entry,
  });
  return null;
}

export function getFormUploadFiles(formData: FormData, key: string): UploadBlob[] {
  const entries: UploadBlob[] = [];
  for (const entry of formData.getAll(key)) {
    if (entry instanceof Blob && entry.size > 0) {
      entries.push(entry);
    }
  }

  logUpload("FILES_SELECTED", {
    field: key,
    count: entries.length,
    files: entries.map((f, i) => ({
      index: i,
      name: f instanceof File ? f.name : "unknown",
      type: f.type || "unknown",
      sizeBytes: f.size,
    })),
  });

  return entries;
}

export function resolveFileMeta(file: UploadBlob, fallbackName: string) {
  const name = file instanceof File ? file.name : fallbackName;
  const type = file.type || "application/octet-stream";
  return { name, type, size: file.size };
}

function requireAssetsAdmin() {
  const admin = getAssetsAdminClient();
  if (!admin) {
    return {
      client: null,
      error:
        "Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY in environment.",
    };
  }
  return { client: admin, error: null };
}

/** Verify bucket exists using service role (private buckets are invisible to anon/publishable keys). */
export async function verifyStorageBucket(): Promise<
  { ok: true; bucket: { id: string; name: string } } | { ok: false; error: string }
> {
  const { client, error } = requireAssetsAdmin();
  if (!client || error) {
    return { ok: false, error: error ?? "Storage admin client unavailable." };
  }

  const { data, error: bucketError } = await client.storage.getBucket(BRAND_ASSETS_BUCKET);

  if (bucketError || !data) {
    const message = bucketError?.message ?? "Bucket not found";
    logUploadError("BUCKET_VERIFY", bucketError ?? new Error(message), {
      bucket: BRAND_ASSETS_BUCKET,
    });
    return {
      ok: false,
      error: `Storage bucket "${BRAND_ASSETS_BUCKET}" is missing. Run: npx tsx scripts/provision-brand-assets-storage.ts`,
    };
  }

  logUpload("BUCKET_VERIFY", {
    bucket: BRAND_ASSETS_BUCKET,
    exists: true,
    public: data.public ?? null,
    fileSizeLimit: data.file_size_limit ?? null,
    allowedMimeTypes: data.allowed_mime_types ?? null,
  });

  return { ok: true, bucket: data };
}

export async function uploadBufferToStorage(
  storagePath: string,
  buffer: Buffer,
  contentType: string,
) {
  const { client, error } = requireAssetsAdmin();
  if (!client || error) {
    return { ok: false as const, error, data: null };
  }

  logUpload("STORAGE_UPLOAD", {
    bucket: BRAND_ASSETS_BUCKET,
    path: storagePath,
    contentType,
    sizeBytes: buffer.length,
  });

  const result = await client.storage.from(BRAND_ASSETS_BUCKET).upload(storagePath, buffer, {
    contentType,
    upsert: false,
  });

  if (result.error) {
    logUploadError("STORAGE_RESPONSE", result.error, {
      bucket: BRAND_ASSETS_BUCKET,
      path: storagePath,
      statusCode: (result.error as { statusCode?: string }).statusCode ?? null,
    });
    return { ok: false as const, error: result.error.message, data: null };
  }

  logUpload("STORAGE_RESPONSE", {
    success: true,
    bucket: BRAND_ASSETS_BUCKET,
    path: storagePath,
    id: result.data?.id ?? null,
  });

  return { ok: true as const, error: null, data: result.data };
}

export async function uploadToStorage(
  storagePath: string,
  file: UploadBlob,
  contentType: string,
) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return uploadBufferToStorage(storagePath, buffer, contentType);
}

/** Convert PNG/JPEG/WebP uploads to optimized WebP before storage. */
export async function uploadOptimizedImageToStorage(
  storagePath: string,
  file: UploadBlob,
  options?: { maxWidth?: number; maxHeight?: number; quality?: number },
): Promise<
  | { ok: true; optimized: OptimizedImage; data: NonNullable<Awaited<ReturnType<typeof uploadBufferToStorage>>["data"]> }
  | { ok: false; error: string }
> {
  const mime = file.type || "application/octet-stream";

  if (!isOptimizableImageMime(mime)) {
    return { ok: false, error: "Unsupported image type for optimization." };
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const optimized = await optimizeImageToWebp(input, options);

    logUpload("IMAGE_OPTIMIZE", {
      path: storagePath,
      originalBytes: input.length,
      optimizedBytes: optimized.sizeBytes,
      width: optimized.width,
      height: optimized.height,
      format: "webp",
    });

    const upload = await uploadBufferToStorage(
      storagePath,
      optimized.buffer,
      optimized.mimeType,
    );

    if (!upload.ok) {
      return { ok: false, error: upload.error ?? "Storage upload failed." };
    }

    return { ok: true, optimized, data: upload.data! };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Image optimization failed.";
    logUploadError("IMAGE_OPTIMIZE", error, { path: storagePath });
    return { ok: false, error: message };
  }
}

export async function verifyStorageObjectExists(
  storagePath: string,
): Promise<boolean> {
  const { client, error } = requireAssetsAdmin();
  if (!client || error) return false;

  const parts = storagePath.split("/");
  const fileName = parts.pop();
  const folder = parts.join("/");
  if (!fileName) return false;

  const { data, error: listError } = await client.storage
    .from(BRAND_ASSETS_BUCKET)
    .list(folder, { limit: 20, search: fileName });

  if (listError) {
    logUploadError("STORAGE_VERIFY", listError, { storagePath });
    return false;
  }

  return data?.some((item) => item.name === fileName) ?? false;
}

export async function createSignedPreviewUrl(storagePath: string) {
  const { client, error } = requireAssetsAdmin();
  if (!client || error) {
    return { url: null, error };
  }

  logUpload("URL_GENERATION", { bucket: BRAND_ASSETS_BUCKET, path: storagePath });

  const { data, error: urlError } = await client.storage
    .from(BRAND_ASSETS_BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (urlError) {
    logUploadError("URL_GENERATION", urlError, { path: storagePath });
    return { url: null, error: urlError.message };
  }

  logUpload("URL_GENERATION", {
    success: true,
    path: storagePath,
    signedUrl: data?.signedUrl ? `${data.signedUrl.slice(0, 80)}…` : null,
  });

  return { url: data?.signedUrl ?? null, error: null };
}

async function insertAssetRowOnce(
  row: {
    brand_id: string;
    asset_type: AssetType;
    storage_path: string;
    file_name: string;
    mime_type: string;
    file_size: number;
  },
  authUserId: string,
) {
  const admin = getAssetsAdminClient();
  if (!admin) {
    return {
      ok: false as const,
      id: null,
      error: "Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY in environment.",
    };
  }

  const { data, error } = await admin
    .from("brand_assets")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    if (error.message?.toLowerCase().includes("row-level security")) {
      logRlsFailure("INSERT", "brand_assets", authUserId, row.brand_id, row, error);
    }
    return { ok: false as const, id: null, error: error.message };
  }

  return { ok: true as const, id: data?.id ?? null, error: null };
}

export async function insertAssetRow(
  row: {
    brand_id: string;
    asset_type: AssetType;
    storage_path: string;
    file_name: string;
    mime_type: string;
    file_size: number;
  },
  authUserId: string,
) {
  logUpload("DATABASE_INSERT", {
    table: "brand_assets",
    operation: "INSERT",
    brandId: row.brand_id,
    assetType: row.asset_type,
    fileName: row.file_name,
    fileSize: row.file_size,
    storagePath: row.storage_path,
    authUserId,
    bucket: BRAND_ASSETS_BUCKET,
    payload: row,
    client: "service_role",
  });

  let result = await insertAssetRowOnce(row, authUserId);

  if (
    !result.ok &&
    row.asset_type === "document" &&
    isDocumentEnumError(result.error)
  ) {
    logUpload("DOCUMENT_ENUM_FALLBACK", {
      brandId: row.brand_id,
      storagePath: row.storage_path,
      fallbackType: brochureStorageAssetType(),
    });
    result = await insertAssetRowOnce(
      { ...row, asset_type: brochureStorageAssetType() },
      authUserId,
    );
  }

  if (!result.ok) {
    logUploadError("DATABASE_INSERT", new Error(result.error ?? "Insert failed"), {
      brandId: row.brand_id,
      authUserId,
      storagePath: row.storage_path,
    });
    return result;
  }

  logUpload("DATABASE_INSERT", {
    success: true,
    assetId: result.id,
    brandId: row.brand_id,
    assetType: row.asset_type,
  });

  return result;
}

export async function deleteAssetRow(
  assetId: string,
  authUserId: string,
  brandId?: string | null,
) {
  logUpload("DATABASE_DELETE", {
    table: "brand_assets",
    operation: "DELETE",
    assetId,
    authUserId,
    brandId: brandId ?? null,
    client: "service_role",
  });

  const admin = getAssetsAdminClient();
  if (!admin) {
    return {
      ok: false as const,
      error: "Storage is not configured. Set SUPABASE_SERVICE_ROLE_KEY in environment.",
    };
  }

  const { error } = await admin.from("brand_assets").delete().eq("id", assetId);

  if (error) {
    if (error.message?.toLowerCase().includes("row-level security")) {
      logRlsFailure("DELETE", "brand_assets", authUserId, brandId ?? null, { assetId }, error);
    }
    logUploadError("DATABASE_DELETE", error, { assetId, authUserId, code: error.code });
    return { ok: false as const, error: error.message };
  }

  return { ok: true as const, error: null };
}

export async function removeStorageObject(storagePath: string) {
  const { client, error } = requireAssetsAdmin();
  if (!client || error) {
    logUploadError("STORAGE_DELETE", new Error(error ?? "No admin client"), {
      path: storagePath,
    });
    return;
  }

  const { error: removeError } = await client.storage
    .from(BRAND_ASSETS_BUCKET)
    .remove([storagePath]);

  if (removeError) {
    logUploadError("STORAGE_DELETE", removeError, { path: storagePath });
  }
}
