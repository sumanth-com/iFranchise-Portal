import {
  BRAND_CORE_FIELDS,
  BRAND_FULL_SELECT,
} from "@/lib/brand/fields";
import { normalizeBrand } from "@/lib/brand/normalize";
import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/brand";

export const BRAND_SELECT_FIELDS = BRAND_FULL_SELECT;

export type GetClientBrandResult =
  | { brand: Brand | null; error: null }
  | { brand: null; error: string };

export type GetClientBrandsResult =
  | { brands: Brand[]; error: null }
  | { brands: []; error: string };

type BrandRow = Parameters<typeof normalizeBrand>[0];

async function fetchBrandsForUser(
  userId: string,
  brandId?: string,
): Promise<GetClientBrandsResult> {
  const supabase = await createClient();

  let query = supabase
    .from("brands")
    .select(BRAND_FULL_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (brandId) {
    query = query.eq("id", brandId);
  }

  const full = await query;

  if (!full.error && full.data) {
    return {
      brands: (full.data ?? []).map((row) =>
      normalizeBrand(row as unknown as BrandRow),
    ),
      error: null,
    };
  }

  const msg = full.error?.message ?? "";
  const missingExtended =
    msg.includes("does not exist") ||
    msg.includes("investment_min") ||
    msg.includes("category");

  if (!missingExtended && full.error) {
    console.warn("[brand schema] Brand load failed:", msg);
    return {
      brands: [],
      error: "Unable to load your brands. Please refresh and try again.",
    };
  }

  let coreQuery = supabase
    .from("brands")
    .select(BRAND_CORE_FIELDS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (brandId) {
    coreQuery = coreQuery.eq("id", brandId);
  }

  const core = await coreQuery;

  if (core.error) {
    console.warn("[brand schema] Core brand load failed:", core.error.message);
    return {
      brands: [],
      error: "Unable to load your brands. Please refresh and try again.",
    };
  }

  return {
    brands: (core.data ?? []).map((row) =>
      normalizeBrand(row as unknown as BrandRow),
    ),
    error: null,
  };
}

export async function getClientBrands(userId: string): Promise<GetClientBrandsResult> {
  return fetchBrandsForUser(userId);
}

export async function getClientBrandById(
  userId: string,
  brandId: string,
): Promise<GetClientBrandResult> {
  const result = await fetchBrandsForUser(userId, brandId);

  if (result.error) {
    return { brand: null, error: result.error };
  }

  return { brand: result.brands[0] ?? null, error: null };
}

/** Returns the most recently updated brand (backward compatible). */
export async function getClientBrand(userId: string): Promise<GetClientBrandResult> {
  const result = await getClientBrands(userId);

  if (result.error) {
    return { brand: null, error: result.error };
  }

  return { brand: result.brands[0] ?? null, error: null };
}
