import type { Brand, FranchiseModel } from "@/types/brand";

type BrandRow = Partial<Brand> & {
  id: string;
  user_id: string;
  business_name: string;
  status: Brand["status"];
  created_at: string;
  updated_at: string;
};

const VALID_MODELS = new Set<FranchiseModel>([
  "FOFO",
  "FICO",
  "FOCO",
  "unit",
  "master",
]);

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function asFranchiseModels(value: unknown): FranchiseModel[] {
  return asStringArray(value).filter((m): m is FranchiseModel =>
    VALID_MODELS.has(m as FranchiseModel),
  );
}

export function normalizeBrand(row: BrandRow): Brand {
  return {
    id: row.id,
    user_id: row.user_id,
    business_name: row.business_name,
    tagline: row.tagline ?? null,
    description: row.description ?? null,
    website_url: row.website_url ?? null,
    contact_email: row.contact_email ?? null,
    contact_phone: row.contact_phone ?? null,
    industry: row.industry ?? null,
    category: row.category ?? null,
    status: row.status,
    admin_feedback: row.admin_feedback ?? null,
    submitted_at: row.submitted_at ?? null,
    reviewed_at: row.reviewed_at ?? null,
    reviewed_by: row.reviewed_by ?? null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    investment_min: row.investment_min ?? null,
    investment_max: row.investment_max ?? null,
    franchise_fee: row.franchise_fee ?? null,
    space_required_sqft: row.space_required_sqft ?? null,
    roi_percent: row.roi_percent ?? null,
    payback_period_months: row.payback_period_months ?? null,
    franchise_models: asFranchiseModels(row.franchise_models),
    current_outlets: row.current_outlets ?? null,
    existing_cities: asStringArray(row.existing_cities),
    target_cities: asStringArray(row.target_cities),
    expansion_tier_1: asStringArray(row.expansion_tier_1),
    expansion_tier_2: asStringArray(row.expansion_tier_2),
    expansion_metro: asStringArray(row.expansion_metro),
    agreement_term_years: row.agreement_term_years ?? null,
    lock_in_period_months: row.lock_in_period_months ?? null,
    publish_ready: row.publish_ready ?? false,
    published_at: row.published_at ?? null,
  };
}
