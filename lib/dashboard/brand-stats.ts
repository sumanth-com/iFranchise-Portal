import type { Brand } from "@/types/brand";

export type BrandPortfolioStats = {
  total: number;
  draft: number;
  underReview: number;
  approved: number;
  rejected: number;
};

export function computeBrandPortfolioStats(brands: Brand[]): BrandPortfolioStats {
  return {
    total: brands.length,
    draft: brands.filter((b) => b.status === "draft").length,
    underReview: brands.filter(
      (b) => b.status === "submitted" || b.status === "changes_requested",
    ).length,
    approved: brands.filter((b) => b.status === "approved").length,
    rejected: brands.filter((b) => b.status === "rejected").length,
  };
}
