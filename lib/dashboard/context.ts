import { cache } from "react";

import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { computeSectionProgress } from "@/lib/dashboard/section-completion";
import { getClientBrand } from "@/lib/brand/queries";
import type { BrandAssetsBundle } from "@/types/assets";

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
  const { brand, error: brandError } = await getClientBrand(profile.id);

  const assetsResult = brand
    ? await getBrandAssets(brand.id)
    : { assets: emptyAssets(), error: null };

  const sections = computeSectionProgress(brand, assetsResult.assets);

  return {
    profile,
    brand,
    assets: assetsResult.assets,
    brandError,
    assetsError: assetsResult.error,
    sections,
  };
});
