import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

export type SectionCompletionState = "completed" | "needs_review" | "not_started";

export type SectionKey =
  | "dashboard"
  | "my_brand"
  | "brand_preview"
  | "assets"
  | "documents"
  | "investment"
  | "franchise_model"
  | "expansion"
  | "locations"
  | "review_submit"
  | "notifications"
  | "timeline"
  | "support"
  | "settings";

export type SectionProgress = {
  key: SectionKey;
  label: string;
  percent: number;
  state: SectionCompletionState;
  href: string;
};

function stateFromPercent(percent: number): SectionCompletionState {
  if (percent >= 100) return "completed";
  if (percent > 0) return "needs_review";
  return "not_started";
}

function pct(filled: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}

function hasText(v: string | null | undefined): boolean {
  return Boolean(v?.trim());
}

function hasNum(v: number | null | undefined): boolean {
  return v != null && !Number.isNaN(v);
}

export function computeSectionProgress(
  brand: Brand | null,
  assets: BrandAssetsBundle,
): SectionProgress[] {
  const brandInfoChecks = brand
    ? [
        hasText(brand.business_name),
        hasText(brand.industry),
        hasText(brand.category),
        hasText(brand.description),
        hasText(brand.contact_email),
      ]
    : [false, false, false, false, false];

  const assetChecks = [
    Boolean(assets.logo),
    assets.gallery.length > 0,
    assets.storePhotos.length > 0 || assets.productPhotos.length > 0,
  ];

  const investmentChecks = brand
    ? [
        hasNum(brand.investment_min),
        hasNum(brand.franchise_fee),
        hasNum(brand.space_required_sqft),
        hasNum(brand.roi_percent),
      ]
    : [false, false, false, false];

  const franchiseChecks = brand ? [brand.franchise_models.length > 0] : [false];

  const locationChecks = brand
    ? [
        hasNum(brand.current_outlets),
        brand.existing_cities.length > 0,
      ]
    : [false, false];

  const expansionChecks = brand
    ? [
        brand.target_cities.length > 0,
        brand.expansion_tier_1.length > 0 ||
          brand.expansion_tier_2.length > 0 ||
          brand.expansion_metro.length > 0,
      ]
    : [false, false];

  const documentChecks = [assets.documents.length > 0];

  const reviewChecks = brand
    ? [
        brand.status === "submitted" ||
          brand.status === "approved" ||
          brand.status === "changes_requested",
      ]
    : [false];

  const sections: Omit<SectionProgress, "state">[] = [
    {
      key: "my_brand",
      label: "Brand Information",
      percent: pct(brandInfoChecks.filter(Boolean).length, brandInfoChecks.length),
      href: "/dashboard/onboarding?step=1",
    },
    {
      key: "assets",
      label: "Assets",
      percent: pct(assetChecks.filter(Boolean).length, assetChecks.length),
      href: "/dashboard/onboarding?step=2",
    },
    {
      key: "investment",
      label: "Investment",
      percent: pct(investmentChecks.filter(Boolean).length, investmentChecks.length),
      href: "/dashboard/onboarding?step=3",
    },
    {
      key: "franchise_model",
      label: "Franchise Model",
      percent: pct(franchiseChecks.filter(Boolean).length, franchiseChecks.length),
      href: "/dashboard/onboarding?step=4",
    },
    {
      key: "locations",
      label: "Locations",
      percent: pct(locationChecks.filter(Boolean).length, locationChecks.length),
      href: "/dashboard/onboarding?step=5",
    },
    {
      key: "expansion",
      label: "Expansion Plan",
      percent: pct(expansionChecks.filter(Boolean).length, expansionChecks.length),
      href: "/dashboard/onboarding?step=6",
    },
    {
      key: "documents",
      label: "Documents",
      percent: pct(documentChecks.filter(Boolean).length, documentChecks.length),
      href: "/dashboard/onboarding?step=8",
    },
    {
      key: "review_submit",
      label: "Review & Submit",
      percent: pct(reviewChecks.filter(Boolean).length, reviewChecks.length),
      href: "/dashboard/onboarding?step=9",
    },
  ];

  const overall = sections.length
    ? Math.round(sections.reduce((s, x) => s + x.percent, 0) / sections.length)
    : 0;

  return [
    {
      key: "dashboard",
      label: "Dashboard",
      percent: overall,
      href: "/dashboard",
      state: stateFromPercent(overall),
    },
    ...sections.map((s) => ({ ...s, state: stateFromPercent(s.percent) })),
    {
      key: "brand_preview",
      label: "Brand Preview",
      percent: brand ? 100 : 0,
      href: "/dashboard/brand-preview",
      state: brand ? "completed" : "not_started",
    },
    {
      key: "notifications",
      label: "Notifications",
      percent: 100,
      href: "/dashboard/notifications",
      state: "completed",
    },
    {
      key: "timeline",
      label: "Timeline",
      percent: brand ? 100 : 0,
      href: "/dashboard/timeline",
      state: brand ? "completed" : "not_started",
    },
    {
      key: "support",
      label: "Support",
      percent: 100,
      href: "/dashboard/support",
      state: "completed",
    },
    {
      key: "settings",
      label: "Settings",
      percent: 100,
      href: "/dashboard/settings",
      state: "completed",
    },
  ];
}

export function getOverallProgress(sections: SectionProgress[]): number {
  const tracked = sections.filter((s) =>
    [
      "my_brand",
      "assets",
      "investment",
      "franchise_model",
      "locations",
      "expansion",
      "documents",
    ].includes(s.key),
  );
  if (!tracked.length) return 0;
  return Math.round(
    tracked.reduce((sum, s) => sum + s.percent, 0) / tracked.length,
  );
}

export function progressByKey(
  sections: SectionProgress[],
): Record<SectionKey, SectionProgress> {
  return Object.fromEntries(sections.map((s) => [s.key, s])) as Record<
    SectionKey,
    SectionProgress
  >;
}
