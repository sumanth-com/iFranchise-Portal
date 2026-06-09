import type { PublicBrandSummary } from "@/types/api/public-brand";

export type MarketplaceFilters = {
  q?: string | null;
  industry?: string | null;
  city?: string | null;
  investmentMin?: number | null;
  investmentMax?: number | null;
  page?: number;
  pageSize?: number;
};

export type MarketplaceBrand = PublicBrandSummary & {
  slug: string;
  investmentMin: number | null;
  investmentMax: number | null;
  targetCities: string[];
};

export type MarketplaceQueryResult = {
  brands: MarketplaceBrand[];
  total: number;
  page: number;
  pageSize: number;
  industries: string[];
  cities: string[];
};

export type MarketplacePageData = MarketplaceQueryResult;
