import { isBrochureAsset } from "@/lib/assets/brochure-compat";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type BrandHealthItem = {
  id: string;
  label: string;
  percent: number;
  complete: boolean;
  href: string;
};

export type BrandHealthSummary = {
  completion: number;
  items: BrandHealthItem[];
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasNum(value: number | null | undefined): boolean {
  return value != null && !Number.isNaN(value);
}

function percentFromChecks(checks: boolean[]): number {
  if (checks.length === 0) return 0;
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function healthItem(
  id: string,
  label: string,
  checks: boolean[],
  href: string,
): BrandHealthItem {
  const percent = percentFromChecks(checks);
  return {
    id,
    label,
    percent,
    complete: percent === 100,
    href,
  };
}

export function buildBrandHealth(
  brand: Brand | null,
  assets: BrandAssetsBundle,
  editBasePath: string,
): BrandHealthSummary {
  const step = (n: number) => `${editBasePath}?step=${n}`;
  const brochures = assets.documents.filter(isBrochureAsset);

  const items: BrandHealthItem[] = [
    healthItem("logo", "Logo", [Boolean(assets.logo)], step(2)),
    healthItem(
      "gallery",
      "Gallery",
      [
        assets.gallery.length > 0,
        assets.storePhotos.length > 0,
        assets.productPhotos.length > 0,
      ],
      step(2),
    ),
    healthItem("brochure", "Brochure", [brochures.length > 0], step(8)),
    healthItem(
      "investment",
      "Investment Data",
      brand
        ? [
            hasNum(brand.investment_min),
            hasNum(brand.franchise_fee),
            hasNum(brand.space_required_sqft),
            hasNum(brand.roi_percent),
          ]
        : [false, false, false, false],
      step(3),
    ),
    healthItem(
      "expansion",
      "Expansion Plan",
      brand
        ? [
            brand.target_cities.length > 0,
            brand.expansion_tier_1.length > 0 ||
              brand.expansion_tier_2.length > 0 ||
              brand.expansion_metro.length > 0,
          ]
        : [false, false],
      step(6),
    ),
    healthItem(
      "faq",
      "FAQ & Details",
      brand
        ? [
            hasText(brand.business_name),
            hasText(brand.industry),
            hasText(brand.description),
            hasText(brand.tagline),
            hasText(brand.contact_email),
          ]
        : [false, false, false, false, false],
      step(1),
    ),
    healthItem(
      "documents",
      "Documents",
      brand
        ? [brochures.length > 0, hasNum(brand.agreement_term_years)]
        : [false, false],
      step(8),
    ),
  ];

  const completion = items.length
    ? Math.round(items.reduce((sum, item) => sum + item.percent, 0) / items.length)
    : 0;

  return { completion, items };
}

export function buildPortfolioHealth(
  brands: Brand[],
  assetsByBrandId: Record<string, BrandAssetsBundle>,
): BrandHealthSummary {
  if (brands.length === 0) {
    const href = "/dashboard/brands/new";
    const empty = (id: string, label: string): BrandHealthItem => ({
      id,
      label,
      percent: 0,
      complete: false,
      href,
    });

    return {
      completion: 0,
      items: [
        empty("logo", "Logo"),
        empty("gallery", "Gallery"),
        empty("brochure", "Brochure"),
        empty("investment", "Investment Data"),
        empty("expansion", "Expansion Plan"),
        empty("faq", "FAQ & Details"),
        empty("documents", "Documents"),
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
