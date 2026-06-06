export type BrandStatus =
  | "draft"
  | "submitted"
  | "approved"
  | "rejected"
  | "changes_requested";

export type FranchiseModel =
  | "FOFO"
  | "FICO"
  | "FOCO"
  | "unit"
  | "master";

export const FRANCHISE_MODEL_OPTIONS: {
  value: FranchiseModel;
  label: string;
  description: string;
}[] = [
  { value: "FOFO", label: "FOFO", description: "Franchise Owned, Franchise Operated" },
  { value: "FICO", label: "FICO", description: "Franchise Invested, Company Operated" },
  { value: "FOCO", label: "FOCO", description: "Franchise Owned, Company Operated" },
  { value: "unit", label: "Unit Franchise", description: "Single outlet franchise" },
  { value: "master", label: "Master Franchise", description: "Regional master rights" },
];

export type Brand = {
  id: string;
  user_id: string;
  business_name: string;
  tagline: string | null;
  description: string | null;
  website_url: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  industry: string | null;
  category: string | null;
  status: BrandStatus;
  admin_feedback: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  investment_min: number | null;
  investment_max: number | null;
  franchise_fee: number | null;
  space_required_sqft: number | null;
  roi_percent: number | null;
  payback_period_months: number | null;
  franchise_models: FranchiseModel[];
  current_outlets: number | null;
  existing_cities: string[];
  target_cities: string[];
  expansion_tier_1: string[];
  expansion_tier_2: string[];
  expansion_metro: string[];
  agreement_term_years: number | null;
  lock_in_period_months: number | null;
  publish_ready: boolean;
  published_at: string | null;
};

export type BrandActionState = {
  error: string | null;
  message: string | null;
  brandId?: string | null;
};

export const initialBrandActionState: BrandActionState = {
  error: null,
  message: null,
};

export function isBrandEditable(status: BrandStatus): boolean {
  return (
    status === "draft" ||
    status === "rejected" ||
    status === "submitted" ||
    status === "changes_requested"
  );
}

export function isBrandLocked(status: BrandStatus): boolean {
  return status === "approved";
}

export function brandEditPath(brandId: string, step = 1): string {
  return `/dashboard/brands/${brandId}/edit?step=${step}`;
}

export function brandNewPath(brandId?: string | null, step = 1): string {
  const params = new URLSearchParams({ step: String(step) });
  if (brandId) {
    params.set("brandId", brandId);
  }
  return `/dashboard/brands/new?${params.toString()}`;
}

export const BRAND_CREATION_STEPS = [
  { id: 1, slug: "basic", title: "Basic Information" },
  { id: 2, slug: "assets", title: "Brand Assets" },
  { id: 3, slug: "investment", title: "Investment Details" },
  { id: 4, slug: "franchise", title: "Franchise Model" },
  { id: 5, slug: "locations", title: "Locations" },
  { id: 6, slug: "expansion", title: "Expansion Plan" },
  { id: 7, slug: "documents", title: "Documents" },
  { id: 8, slug: "review", title: "Review & Submit" },
] as const;

/** @deprecated Use BRAND_CREATION_STEPS — kept for legacy references */
export const ONBOARDING_STEPS = BRAND_CREATION_STEPS;
