import { cache } from "react";

import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrands } from "@/lib/brand/queries";
import { computeBrandPortfolioStats } from "@/lib/dashboard/brand-stats";
import { buildPortfolioHealth } from "@/lib/dashboard/brand-health";
import type { BrandAssetsBundle } from "@/types/assets";
import type { Brand } from "@/types/brand";

function emptyAssets(): BrandAssetsBundle {
  return {
    logo: null,
    gallery: [],
    storePhotos: [],
    productPhotos: [],
    documents: [],
  };
}

export const getDashboardContext = cache(async () => {
  const profile = await requireClient();
  const { brands, error: brandsError } = await getClientBrands(profile.id);

  const assetsByBrandId: Record<string, BrandAssetsBundle> = {};
  const assetsResults = await Promise.all(
    brands.map(async (brand) => {
      const result = await getBrandAssets(brand.id);
      assetsByBrandId[brand.id] = result.assets;
      return result;
    }),
  );

  const brand = brands[0] ?? null;
  const assets = brand ? assetsByBrandId[brand.id] : emptyAssets();
  const assetsError = assetsResults.find((r) => r.error)?.error ?? null;
  const stats = computeBrandPortfolioStats(brands);
  const health = buildPortfolioHealth(brands, assetsByBrandId);

  return {
    profile,
    brands,
    brand,
    assets,
    assetsByBrandId,
    brandsError,
    assetsError,
    stats,
    health,
  };
});

export type BrandWithAssets = {
  brand: Brand;
  assets: BrandAssetsBundle;
};

export async function getBrandWithAssets(
  userId: string,
  brandId: string,
): Promise<{ data: BrandWithAssets | null; error: string | null }> {
  const { brands, error } = await getClientBrands(userId);
  if (error) return { data: null, error };

  const brand = brands.find((b) => b.id === brandId);
  if (!brand) return { data: null, error: "Brand not found." };

  const assetsResult = await getBrandAssets(brand.id);
  return {
    data: { brand, assets: assetsResult.assets },
    error: assetsResult.error,
  };
}
