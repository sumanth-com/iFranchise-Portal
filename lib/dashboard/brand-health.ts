import { calculateBrandCompletion } from "@/lib/brand/completion";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type BrandHealthItem = {
  id: string;
  label: string;
  complete: boolean;
  href: string;
};

export type BrandHealthSummary = {
  completion: number;
  items: BrandHealthItem[];
};

export function buildBrandHealth(
  brand: Brand | null,
  assets: BrandAssetsBundle,
  editBasePath: string,
): BrandHealthSummary {
  const step = (n: number) => `${editBasePath}?step=${n}`;

  const items: BrandHealthItem[] = [
    {
      id: "logo",
      label: "Logo",
      complete: Boolean(assets.logo),
      href: step(2),
    },
    {
      id: "gallery",
      label: "Gallery",
      complete:
        assets.gallery.length > 0 ||
        assets.storePhotos.length > 0 ||
        assets.productPhotos.length > 0,
      href: step(2),
    },
    {
      id: "brochure",
      label: "Brochure",
      complete: assets.documents.length > 0,
      href: step(8),
    },
    {
      id: "investment",
      label: "Investment Data",
      complete: brand?.investment_min != null && brand?.franchise_fee != null,
      href: step(3),
    },
    {
      id: "expansion",
      label: "Expansion Plan",
      complete: (brand?.target_cities.length ?? 0) > 0,
      href: step(6),
    },
    {
      id: "faq",
      label: "FAQ & Details",
      complete: Boolean(brand?.description?.trim()),
      href: step(1),
    },
    {
      id: "documents",
      label: "Documents",
      complete: assets.documents.length > 0,
      href: step(8),
    },
  ];

  const completion = calculateBrandCompletion({
    brand,
    assets,
    documentCount: assets.documents.length,
  });

  return { completion, items };
}

export function buildPortfolioHealth(
  brands: Brand[],
  assetsByBrandId: Record<string, BrandAssetsBundle>,
): BrandHealthSummary {
  if (brands.length === 0) {
    return {
      completion: 0,
      items: [
        { id: "logo", label: "Logo", complete: false, href: "/dashboard/brands/new" },
        { id: "gallery", label: "Gallery", complete: false, href: "/dashboard/brands/new" },
        { id: "brochure", label: "Brochure", complete: false, href: "/dashboard/brands/new" },
        { id: "investment", label: "Investment Data", complete: false, href: "/dashboard/brands/new" },
        { id: "expansion", label: "Expansion Plan", complete: false, href: "/dashboard/brands/new" },
        { id: "faq", label: "FAQ", complete: false, href: "/dashboard/brands/new" },
        { id: "documents", label: "Documents", complete: false, href: "/dashboard/brands/new" },
      ],
    };
  }

  const primary = brands[0];
  const assets = assetsByBrandId[primary.id] ?? {
    logo: null,
    gallery: [],
    storePhotos: [],
    productPhotos: [],
    documents: [],
  };

  return buildBrandHealth(primary, assets, `/dashboard/brands/${primary.id}/edit`);
}
