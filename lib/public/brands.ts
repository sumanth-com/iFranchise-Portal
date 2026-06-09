import { BRAND_ASSETS_BUCKET } from "@/lib/assets/constants";
import { createServiceClient } from "@/lib/supabase/service";
import { brandSlugFromName } from "@/lib/utils/slug";
import type {
  PublicBrandDetail,
  PublicBrandImage,
  PublicBrandSummary,
} from "@/types/api/public-brand";
import type { AssetType } from "@/types/assets";
import type { MarketplaceFilters } from "@/types/marketplace";

/** Longer-lived URLs for public website consumption (24 hours). */
const PUBLIC_SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const APPROVED_BRAND_FIELDS =
  "id, business_name, tagline, description, industry, website_url, contact_email, contact_phone, reviewed_at, updated_at, published_at, slug, investment_min, investment_max, target_cities, existing_cities, franchise_fee, roi_percent";

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
  published_at: string | null;
  slug?: string | null;
  investment_min?: number | null;
  investment_max?: number | null;
  target_cities?: string[];
  existing_cities?: string[];
  franchise_fee?: number | null;
  roi_percent?: number | null;
};

const CORE_PUBLISHED_FIELDS =
  "id, business_name, tagline, description, industry, website_url, contact_email, contact_phone, reviewed_at, updated_at, published_at";

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

function resolveSlug(brand: ApprovedBrandRow): string {
  return brand.slug?.trim() || brandSlugFromName(brand.business_name, brand.id);
}

function toSummary(
  brand: ApprovedBrandRow,
  assets: AssetRow[],
  urlById: Map<string, string>,
): PublicBrandSummary {
  const { logo, gallery } = splitAssets(assets, urlById);

  return {
    id: brand.id,
    slug: resolveSlug(brand),
    businessName: brand.business_name,
    tagline: brand.tagline,
    industry: brand.industry,
    logo,
    gallery,
    publishedAt: brand.published_at ?? brand.reviewed_at,
    updatedAt: brand.updated_at,
    investmentMin: brand.investment_min ?? null,
    investmentMax: brand.investment_max ?? null,
    targetCities: brand.target_cities ?? [],
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
    existingCities: brand.existing_cities ?? [],
    franchiseFee: brand.franchise_fee ?? null,
    roiPercent: brand.roi_percent ?? null,
  };
}

async function selectPublishedBrands(
  supabase: NonNullable<ReturnType<typeof createServiceClient>>,
  selectFields: string,
) {
  const { data, error } = await supabase
    .from("brands")
    .select(selectFields)
    .eq("status", "approved")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false });

  if (error?.message?.includes("Could not find")) {
    const fallback = await supabase
      .from("brands")
      .select(CORE_PUBLISHED_FIELDS)
      .eq("status", "approved")
      .not("published_at", "is", null)
      .order("published_at", { ascending: false, nullsFirst: false });
    return fallback;
  }

  return { data, error };
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
    const { data: brands, error: brandsError } = await selectPublishedBrands(
      supabase,
      APPROVED_BRAND_FIELDS,
    );

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

export async function getMarketplaceBrands(
  filters: MarketplaceFilters = {},
): Promise<
  PublicBrandsQueryResult<{
    brands: PublicBrandSummary[];
    total: number;
    industries: string[];
    cities: string[];
    page: number;
    pageSize: number;
  }>
> {
  const supabase = getClient();
  if (!supabase) {
    return { data: null, error: "SERVICE_UNAVAILABLE" };
  }

  try {
    const { data: brands, error: brandsError } = await selectPublishedBrands(
      supabase,
      APPROVED_BRAND_FIELDS,
    );

    if (brandsError) throw brandsError;

    let rows = (brands ?? []) as ApprovedBrandRow[];

    const q = filters.q?.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (b) =>
          b.business_name.toLowerCase().includes(q) ||
          b.tagline?.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.industry?.toLowerCase().includes(q),
      );
    }

    if (filters.industry) {
      rows = rows.filter(
        (b) => b.industry?.toLowerCase() === filters.industry!.toLowerCase(),
      );
    }

    if (filters.city) {
      const city = filters.city.toLowerCase();
      rows = rows.filter((b) =>
        [...(b.target_cities ?? []), ...(b.existing_cities ?? [])].some(
          (c) => c.toLowerCase() === city,
        ),
      );
    }

    if (filters.investmentMin != null) {
      rows = rows.filter(
        (b) =>
          b.investment_max == null || b.investment_max >= filters.investmentMin!,
      );
    }

    if (filters.investmentMax != null) {
      rows = rows.filter(
        (b) =>
          b.investment_min == null || b.investment_min <= filters.investmentMax!,
      );
    }

    const industries = [
      ...new Set(rows.map((b) => b.industry).filter(Boolean) as string[]),
    ].sort();

    const cities = [
      ...new Set(
        rows.flatMap((b) => [
          ...(b.target_cities ?? []),
          ...(b.existing_cities ?? []),
        ]),
      ),
    ].sort();

    const page = Math.max(1, filters.page ?? 1);
    const pageSize = filters.pageSize ?? 12;
    const total = rows.length;
    const paged = rows.slice((page - 1) * pageSize, page * pageSize);

    const brandIds = paged.map((b) => b.id);
    const assets = await fetchAssetsForBrands(supabase, brandIds);
    const urlById = await signAssetUrls(supabase, assets);

    const assetsByBrand = new Map<string, AssetRow[]>();
    for (const asset of assets) {
      const list = assetsByBrand.get(asset.brand_id) ?? [];
      list.push(asset);
      assetsByBrand.set(asset.brand_id, list);
    }

    const summaries = paged.map((brand) =>
      toSummary(brand, assetsByBrand.get(brand.id) ?? [], urlById),
    );

    return {
      data: {
        brands: summaries,
        total,
        industries,
        cities,
        page,
        pageSize,
      },
      error: null,
    };
  } catch {
    return { data: null, error: "INTERNAL_ERROR" };
  }
}

export async function getPublishedBrandBySlug(
  slug: string,
): Promise<PublicBrandsQueryResult<PublicBrandDetail | null>> {
  const supabase = getClient();
  if (!supabase) {
    return { data: null, error: "SERVICE_UNAVAILABLE" };
  }

  try {
    const { data: brands, error } = await selectPublishedBrands(
      supabase,
      APPROVED_BRAND_FIELDS,
    );

    if (error) throw error;

    const rows = (brands ?? []) as ApprovedBrandRow[];
    const match = rows.find(
      (b) =>
        b.slug === slug ||
        resolveSlug(b) === slug ||
        b.id === slug,
    );

    if (!match) {
      return { data: null, error: null };
    }

    const assets = await fetchAssetsForBrands(supabase, [match.id]);
    const urlById = await signAssetUrls(supabase, assets);

    return {
      data: toDetail(match, assets, urlById),
      error: null,
    };
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
    let brandQuery = await supabase
      .from("brands")
      .select(APPROVED_BRAND_FIELDS)
      .eq("id", brandId)
      .eq("status", "approved")
      .not("published_at", "is", null)
      .maybeSingle();

    if (brandQuery.error?.message?.includes("Could not find")) {
      brandQuery = await supabase
        .from("brands")
        .select(CORE_PUBLISHED_FIELDS)
        .eq("id", brandId)
        .eq("status", "approved")
        .not("published_at", "is", null)
        .maybeSingle();
    }

    const { data: brand, error: brandError } = brandQuery;

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
