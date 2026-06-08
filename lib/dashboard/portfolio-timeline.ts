import { buildSubmissionTimeline } from "@/lib/dashboard/timeline";
import type { TimelineEvent } from "@/lib/dashboard/timeline";
import type { Brand } from "@/types/brand";
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

export function buildPortfolioTimeline(
  brands: Brand[],
  assetsByBrandId: Record<string, BrandAssetsBundle>,
): TimelineEvent[] {
  if (brands.length === 0) return [];

  const events: TimelineEvent[] = [];
  for (const brand of brands.slice(0, 3)) {
    const brandEvents = buildSubmissionTimeline(
      brand,
      assetsByBrandId[brand.id] ?? emptyAssets(),
    );
    events.push(
      ...brandEvents
        .filter((e) => e.status === "done" || e.status === "current")
        .slice(0, 2)
        .map((e) => ({
          ...e,
          id: `${brand.id}-${e.id}`,
          title: `${brand.business_name}: ${e.title}`,
        })),
    );
  }

  return events
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, 8);
}
