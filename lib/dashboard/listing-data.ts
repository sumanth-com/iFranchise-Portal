import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type MarketplaceListingData = {
  businessName: string;
  tagline: string;
  industry: string;
  category: string;
  description: string;
  investmentLabel: string;
  roiLabel: string;
  modelLabel: string;
  locationLabel: string;
  outletsLabel: string;
  logoUrl: string | null;
  galleryUrls: string[];
  status: Brand["status"] | "preview";
};

const DEMO_LISTING: MarketplaceListingData = {
  businessName: "Brew & Bean Café",
  tagline: "India's fastest-growing specialty coffee franchise",
  industry: "Food & Beverage",
  category: "Café & Quick Service",
  description:
    "Premium coffee experience with proven unit economics, strong brand recall, and scalable FOFO operations across metro cities.",
  investmentLabel: "₹25L – ₹45L",
  roiLabel: "32% ROI",
  modelLabel: "FOFO · Unit Franchise",
  locationLabel: "Mumbai, Bangalore, Hyderabad",
  outletsLabel: "48+ outlets",
  logoUrl: null,
  galleryUrls: [],
  status: "preview",
};

function formatInvestment(brand: Brand): string {
  if (brand.investment_min != null && brand.investment_max != null) {
    return `₹${(brand.investment_min / 100000).toFixed(0)}L – ₹${(brand.investment_max / 100000).toFixed(0)}L`;
  }
  if (brand.investment_min != null) {
    return `From ₹${brand.investment_min.toLocaleString("en-IN")}`;
  }
  return "On request";
}

export function buildMarketplaceListing(
  brand: Brand | null,
  assets: BrandAssetsBundle,
): MarketplaceListingData {
  if (!brand) {
    return DEMO_LISTING;
  }

  const cities = [
    ...brand.target_cities,
    ...brand.existing_cities,
  ].slice(0, 3);

  const galleryUrls = [
    ...assets.gallery,
    ...assets.storePhotos,
    ...assets.productPhotos,
  ]
    .map((a) => a.previewUrl)
    .filter((u): u is string => Boolean(u))
    .slice(0, 4);

  return {
    businessName: brand.business_name,
    tagline: brand.tagline ?? "Premium franchise opportunity on iFranchise",
    industry: brand.industry ?? "Franchise",
    category: brand.category ?? "Multi-location",
    description:
      brand.description ??
      "Complete your brand story to showcase your franchise to investors.",
    investmentLabel: formatInvestment(brand),
    roiLabel: brand.roi_percent != null ? `${brand.roi_percent}% ROI` : "ROI on request",
    modelLabel:
      brand.franchise_models.length > 0
        ? brand.franchise_models.join(" · ")
        : "Model TBD",
    locationLabel:
      cities.length > 0 ? cities.join(", ") : "Pan-India expansion",
    outletsLabel:
      brand.current_outlets != null
        ? `${brand.current_outlets}+ outlets`
        : "Growing network",
    logoUrl: assets.logo?.previewUrl ?? null,
    galleryUrls,
    status: brand.status,
  };
}

export { displayStatusLabel } from "@/lib/dashboard/brand-display-status";
