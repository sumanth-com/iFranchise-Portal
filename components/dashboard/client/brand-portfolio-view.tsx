"use client";

import { BrandPortfolioCard } from "@/components/dashboard/client/brand-portfolio-card";
import { useClientSettings } from "@/lib/settings/use-client-settings";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";
import { cn } from "@/lib/utils";

type BrandPortfolioViewProps = {
  userId: string;
  brands: Brand[];
  assetsByBrandId: Record<string, BrandAssetsBundle>;
};

const EMPTY_ASSETS: BrandAssetsBundle = {
  logo: null,
  gallery: [],
  storePhotos: [],
  productPhotos: [],
  documents: [],
};

export function BrandPortfolioView({
  userId,
  brands,
  assetsByBrandId,
}: BrandPortfolioViewProps) {
  const { prefs, ready } = useClientSettings(userId);
  const layout = ready ? prefs.defaultBrandView : "grid";

  return (
    <div
      className={cn(
        layout === "grid"
          ? "grid grid-cols-1 justify-items-center gap-5 sm:grid-cols-2 xl:grid-cols-3"
          : "flex flex-col gap-3",
      )}
    >
      {brands.map((brand, index) => (
        <BrandPortfolioCard
          key={brand.id}
          brand={brand}
          index={index}
          layout={layout}
          assets={assetsByBrandId[brand.id] ?? EMPTY_ASSETS}
        />
      ))}
    </div>
  );
}
