import { BRAND_ASSETS_BUCKET } from "@/lib/assets/constants";
import { createServiceClient } from "@/lib/supabase/service";
import type {
  PublicBrandDetail,
  PublicBrandImage,
  PublicBrandSummary,
} from "@/types/api/public-brand";
import type { AssetType } from "@/types/assets";

/** Longer-lived URLs for public website consumption (24 hours). */
const PUBLIC_SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const APPROVED_BRAND_FIELDS =
  "id, business_name, tagline, description, industry, website_url, contact_email, contact_phone, reviewed_at, updated_at";

type ApprovedBrandRow = {
  id: string;
  business_name: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  reviewed_at: string | null;
  updated_at: string;
};

type AssetRow = {
  id: string;
  brand_id: string;
  asset_type: AssetType;
  storage_path: string;
  file_name: string;
  mime_type: string;
  file_size: number;
};

export type PublicBrandsQueryResult<T> =
  | { data: T; error: null }
  | { data: null; error: "SERVICE_UNAVAILABLE" | "INTERNAL_ERROR" };

function getClient() {
  return createServiceClient();
}

async function signAssetUrls(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  assets: AssetRow[],
): Promise<Map<string, string>> {
  const urlById = new Map<string, string>();

  await Promise.all(
    assets.map(async (asset) => {
      const { data, error } = await supabase.storage
        .from(BRAND_ASSETS_BUCKET)
        .createSignedUrl(asset.storage_path, PUBLIC_SIGNED_URL_EXPIRY_SECONDS);

      if (!error && data?.signedUrl) {
        urlById.set(asset.id, data.signedUrl);
      }
    }),
  );

  return urlById;
}

function toPublicImage(
  asset: AssetRow,
  urlById: Map<string, string>,
): PublicBrandImage | null {
  const url = urlById.get(asset.id);
  if (!url) {
    return null;
  }

  return {
    id: asset.id,
    url,
    fileName: asset.file_name,
    mimeType: asset.mime_type,
    fileSize: asset.file_size,
  };
}

function splitAssets(assets: AssetRow[], urlById: Map<string, string>) {
  const logoRow = assets.find((a) => a.asset_type === "logo");
  const galleryRows = assets.filter((a) => a.asset_type === "gallery");

  return {
    logo: logoRow ? toPublicImage(logoRow, urlById) : null,
    gallery: galleryRows
      .map((row) => toPublicImage(row, urlById))
      .filter((img): img is PublicBrandImage => img !== null),
  };
}

function toSummary(
  brand: ApprovedBrandRow,
  assets: AssetRow[],
  urlById: Map<string, string>,
): PublicBrandSummary {
  const { logo, gallery } = splitAssets(assets, urlById);

  return {
    id: brand.id,
    businessName: brand.business_name,
    tagline: brand.tagline,
    industry: brand.industry,
    logo,
    gallery,
    publishedAt: brand.reviewed_at,
    updatedAt: brand.updated_at,
  };
}

function toDetail(
  brand: ApprovedBrandRow,
  assets: AssetRow[],
  urlById: Map<string, string>,
): PublicBrandDetail {
  return {
    ...toSummary(brand, assets, urlById),
    description: brand.description,
    contact: {
      email: brand.contact_email,
      phone: brand.contact_phone,
      websiteUrl: brand.website_url,
    },
  };
}

async function fetchAssetsForBrands(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  brandIds: string[],
): Promise<AssetRow[]> {
  if (brandIds.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from("brand_assets")
    .select(
      "id, brand_id, asset_type, storage_path, file_name, mime_type, file_size",
    )
    .in("brand_id", brandIds)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AssetRow[];
}

export async function getPublishedBrands(): Promise<
  PublicBrandsQueryResult<PublicBrandSummary[]>
> {
  const supabase = getClient();
  if (!supabase) {
    return { data: null, error: "SERVICE_UNAVAILABLE" };
  }

  try {
    const { data: brands, error: brandsError } = await supabase
      .from("brands")
      .select(APPROVED_BRAND_FIELDS)
      .eq("status", "approved")
      .order("reviewed_at", { ascending: false, nullsFirst: false });

    if (brandsError) {
      throw brandsError;
    }

    const rows = (brands ?? []) as ApprovedBrandRow[];
    const brandIds = rows.map((b) => b.id);
    const assets = await fetchAssetsForBrands(supabase, brandIds);
    const urlById = await signAssetUrls(supabase, assets);

    const assetsByBrand = new Map<string, AssetRow[]>();
    for (const asset of assets) {
      const list = assetsByBrand.get(asset.brand_id) ?? [];
      list.push(asset);
      assetsByBrand.set(asset.brand_id, list);
    }

    const summaries = rows.map((brand) =>
      toSummary(brand, assetsByBrand.get(brand.id) ?? [], urlById),
    );

    return { data: summaries, error: null };
  } catch {
    return { data: null, error: "INTERNAL_ERROR" };
  }
}

export async function getPublishedBrandById(
  brandId: string,
): Promise<PublicBrandsQueryResult<PublicBrandDetail | null>> {
  const supabase = getClient();
  if (!supabase) {
    return { data: null, error: "SERVICE_UNAVAILABLE" };
  }

  try {
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select(APPROVED_BRAND_FIELDS)
      .eq("id", brandId)
      .eq("status", "approved")
      .maybeSingle();

    if (brandError) {
      throw brandError;
    }

    if (!brand) {
      return { data: null, error: null };
    }

    const assets = await fetchAssetsForBrands(supabase, [brandId]);
    const urlById = await signAssetUrls(supabase, assets);

    return {
      data: toDetail(brand as ApprovedBrandRow, assets, urlById),
      error: null,
    };
  } catch {
    return { data: null, error: "INTERNAL_ERROR" };
  }
}
