import { isBrochureAsset, isGalleryImage } from "@/lib/assets/brochure-compat";
import { BRAND_ASSETS_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from "@/lib/assets/constants";
import { getAssetsAdminClient } from "@/lib/assets/storage-admin";
import { createClient } from "@/lib/supabase/server";
import type { BrandAsset, BrandAssetsBundle, BrandAssetWithUrl } from "@/types/assets";

const ASSET_FIELDS =
  "id, brand_id, asset_type, storage_path, file_name, mime_type, file_size, created_at";

async function attachSignedUrl(
  asset: BrandAsset,
): Promise<BrandAssetWithUrl> {
  const admin = getAssetsAdminClient();
  if (!admin) {
    return { ...asset, previewUrl: null };
  }

  const { data, error } = await admin.storage
    .from(BRAND_ASSETS_BUCKET)
    .createSignedUrl(asset.storage_path, SIGNED_URL_EXPIRY_SECONDS);

  return {
    ...asset,
    previewUrl: error ? null : (data?.signedUrl ?? null),
  };
}

function emptyBundle(): BrandAssetsBundle {
  return {
    logo: null,
    gallery: [],
    storePhotos: [],
    productPhotos: [],
    documents: [],
  };
}

export async function getBrandAssets(
  brandId: string,
): Promise<{ assets: BrandAssetsBundle; error: string | null }> {
  if (!brandId?.trim()) {
    return { assets: emptyBundle(), error: null };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brand_assets")
      .select(ASSET_FIELDS)
      .eq("brand_id", brandId)
      .order("created_at", { ascending: true });

    if (error) {
      return {
        assets: emptyBundle(),
        error: "Unable to load brand assets. Please refresh and try again.",
      };
    }

    const rows = (data ?? []) as BrandAsset[];
    const withUrls = await Promise.all(
      rows.map((row) =>
        attachSignedUrl(row).catch(() => ({
          ...row,
          previewUrl: null,
        })),
      ),
    );

    return {
      assets: {
        logo: withUrls.find((a) => a.asset_type === "logo") ?? null,
        gallery: withUrls.filter(isGalleryImage),
        storePhotos: withUrls.filter((a) => a.asset_type === "store_photo"),
        productPhotos: withUrls.filter((a) => a.asset_type === "product_photo"),
        documents: withUrls.filter(isBrochureAsset),
      },
      error: null,
    };
  } catch (err) {
    console.error("[brand assets] Load failed:", err);
    return {
      assets: emptyBundle(),
      error: "Unable to load brand assets. Please refresh and try again.",
    };
  }
}

export async function getBrandAssetById(
  assetId: string,
): Promise<BrandAsset | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brand_assets")
    .select(ASSET_FIELDS)
    .eq("id", assetId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as BrandAsset;
}
