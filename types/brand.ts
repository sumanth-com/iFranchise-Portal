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
};

export const initialBrandActionState: BrandActionState = {
  error: null,
  message: null,
};

export function isBrandEditable(status: BrandStatus): boolean {
  return status === "draft" || status === "changes_requested";
}

export const ONBOARDING_STEPS = [
  { id: 1, slug: "brand", title: "Brand Information", path: "/dashboard/onboarding?step=1" },
  { id: 2, slug: "assets", title: "Brand Assets", path: "/dashboard/onboarding?step=2" },
  { id: 3, slug: "investment", title: "Investment", path: "/dashboard/onboarding?step=3" },
  { id: 4, slug: "franchise", title: "Franchise Model", path: "/dashboard/onboarding?step=4" },
  { id: 5, slug: "network", title: "Network", path: "/dashboard/onboarding?step=5" },
  { id: 6, slug: "expansion", title: "Expansion", path: "/dashboard/onboarding?step=6" },
  { id: 7, slug: "agreement", title: "Agreement", path: "/dashboard/onboarding?step=7" },
  { id: 8, slug: "documents", title: "Documents", path: "/dashboard/onboarding?step=8" },
  { id: 9, slug: "review", title: "Review & Submit", path: "/dashboard/onboarding?step=9" },
] as const;
