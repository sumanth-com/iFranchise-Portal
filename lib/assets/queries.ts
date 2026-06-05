import {
  BRAND_ASSETS_BUCKET,
  SIGNED_URL_EXPIRY_SECONDS,
} from "@/lib/assets/constants";
import { createClient } from "@/lib/supabase/server";
import type { BrandAsset, BrandAssetsBundle, BrandAssetWithUrl } from "@/types/assets";

const ASSET_FIELDS =
  "id, brand_id, asset_type, storage_path, file_name, mime_type, file_size, created_at";

async function attachSignedUrl(
  asset: BrandAsset,
): Promise<BrandAssetWithUrl> {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
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
  const withUrls = await Promise.all(rows.map(attachSignedUrl));

  return {
    assets: {
      logo: withUrls.find((a) => a.asset_type === "logo") ?? null,
      gallery: withUrls.filter((a) => a.asset_type === "gallery"),
      storePhotos: withUrls.filter((a) => a.asset_type === "store_photo"),
      productPhotos: withUrls.filter((a) => a.asset_type === "product_photo"),
      documents: withUrls.filter((a) => a.asset_type === "document"),
    },
    error: null,
  };
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
