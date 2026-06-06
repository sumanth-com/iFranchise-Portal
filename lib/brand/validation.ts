import { DRAFT_PLACEHOLDER_BUSINESS_NAME } from "@/lib/brand/constants";
import type { Brand, FranchiseModel } from "@/types/brand";

export type BrandFormValues = {
  businessName: string;
  tagline: string | null;
  description: string | null;
  industry: string | null;
  category: string | null;
  websiteUrl: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  investmentMin: number | null;
  investmentMax: number | null;
  franchiseFee: number | null;
  spaceRequiredSqft: number | null;
  roiPercent: number | null;
  paybackPeriodMonths: number | null;
  franchiseModels: FranchiseModel[];
  currentOutlets: number | null;
  existingCities: string[];
  targetCities: string[];
  expansionTier1: string[];
  expansionTier2: string[];
  expansionMetro: string[];
  agreementTermYears: number | null;
  lockInPeriodMonths: number | null;
};

function trimField(formData: FormData, key: string): string | null {
  const value = String(formData.get(key) ?? "").trim();
  return value === "" ? null : value;
}

function parseNumber(formData: FormData, key: string): number | null {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

function parseCityList(formData: FormData, key: string): string[] {
  const raw = String(formData.get(key) ?? "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

function parseFranchiseModels(formData: FormData): FranchiseModel[] {
  const models = formData.getAll("franchiseModels").map(String);
  const valid = new Set<FranchiseModel>(["FOFO", "FICO", "FOCO", "unit", "master"]);
  return models.filter((m): m is FranchiseModel => valid.has(m as FranchiseModel));
}

export function parseBrandFormData(formData: FormData): BrandFormValues {
  return {
    businessName: String(formData.get("businessName") ?? "").trim(),
    tagline: trimField(formData, "tagline"),
    description: trimField(formData, "description"),
    industry: trimField(formData, "industry"),
    category: trimField(formData, "category"),
    websiteUrl: trimField(formData, "websiteUrl"),
    contactEmail: trimField(formData, "contactEmail"),
    contactPhone: trimField(formData, "contactPhone"),
    investmentMin: parseNumber(formData, "investmentMin"),
    investmentMax: parseNumber(formData, "investmentMax"),
    franchiseFee: parseNumber(formData, "franchiseFee"),
    spaceRequiredSqft: parseNumber(formData, "spaceRequiredSqft"),
    roiPercent: parseNumber(formData, "roiPercent"),
    paybackPeriodMonths: parseNumber(formData, "paybackPeriodMonths"),
    franchiseModels: parseFranchiseModels(formData),
    currentOutlets: parseNumber(formData, "currentOutlets"),
    existingCities: parseCityList(formData, "existingCities"),
    targetCities: parseCityList(formData, "targetCities"),
    expansionTier1: parseCityList(formData, "expansionTier1"),
    expansionTier2: parseCityList(formData, "expansionTier2"),
    expansionMetro: parseCityList(formData, "expansionMetro"),
    agreementTermYears: parseNumber(formData, "agreementTermYears"),
    lockInPeriodMonths: parseNumber(formData, "lockInPeriodMonths"),
  };
}

/** Preserve existing DB values when a wizard step omits fields from FormData. */
export function mergeBrandFormWithExisting(
  parsed: BrandFormValues,
  existing: Brand,
  formData: FormData,
): BrandFormValues {
  const has = (key: string) => formData.has(key);
  const hasModels = formData.getAll("franchiseModels").length > 0;

  return {
    businessName: has("businessName") ? parsed.businessName : existing.business_name,
    tagline: has("tagline") ? parsed.tagline : existing.tagline,
    description: has("description") ? parsed.description : existing.description,
    industry: has("industry") ? parsed.industry : existing.industry,
    category: has("category") ? parsed.category : existing.category,
    websiteUrl: has("websiteUrl") ? parsed.websiteUrl : existing.website_url,
    contactEmail: has("contactEmail") ? parsed.contactEmail : existing.contact_email,
    contactPhone: has("contactPhone") ? parsed.contactPhone : existing.contact_phone,
    investmentMin: has("investmentMin") ? parsed.investmentMin : existing.investment_min,
    investmentMax: has("investmentMax") ? parsed.investmentMax : existing.investment_max,
    franchiseFee: has("franchiseFee") ? parsed.franchiseFee : existing.franchise_fee,
    spaceRequiredSqft: has("spaceRequiredSqft")
      ? parsed.spaceRequiredSqft
      : existing.space_required_sqft,
    roiPercent: has("roiPercent") ? parsed.roiPercent : existing.roi_percent,
    paybackPeriodMonths: has("paybackPeriodMonths")
      ? parsed.paybackPeriodMonths
      : existing.payback_period_months,
    franchiseModels: hasModels ? parsed.franchiseModels : (existing.franchise_models ?? []),
    currentOutlets: has("currentOutlets") ? parsed.currentOutlets : existing.current_outlets,
    existingCities: has("existingCities") ? parsed.existingCities : (existing.existing_cities ?? []),
    targetCities: has("targetCities") ? parsed.targetCities : (existing.target_cities ?? []),
    expansionTier1: has("expansionTier1") ? parsed.expansionTier1 : (existing.expansion_tier_1 ?? []),
    expansionTier2: has("expansionTier2") ? parsed.expansionTier2 : (existing.expansion_tier_2 ?? []),
    expansionMetro: has("expansionMetro") ? parsed.expansionMetro : (existing.expansion_metro ?? []),
    agreementTermYears: has("agreementTermYears")
      ? parsed.agreementTermYears
      : existing.agreement_term_years,
    lockInPeriodMonths: has("lockInPeriodMonths")
      ? parsed.lockInPeriodMonths
      : existing.lock_in_period_months,
  };
}

export function validateBrandValues(
  values: BrandFormValues,
  options: { requireAllForSubmit: boolean; isDraft?: boolean },
): string | null {
  if (!options.isDraft && !values.businessName) {
    return "Brand name is required.";
  }

  if (values.businessName && values.businessName.length > 200) {
    return "Brand name must be 200 characters or fewer.";
  }

  if (options.requireAllForSubmit) {
    if (!values.description) return "Description is required before submitting.";
    if (!values.industry) return "Industry is required before submitting.";
    if (!values.category) return "Category is required before submitting.";
    if (!values.contactEmail) return "Contact email is required before submitting.";
    if (values.franchiseModels.length === 0) {
      return "Select at least one franchise model before submitting.";
    }
    if (values.investmentMin == null) return "Investment range is required before submitting.";
    if (values.franchiseFee == null) return "Franchise fee is required before submitting.";
  }

  if (values.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail)) {
    return "Contact email is not valid.";
  }

  if (values.websiteUrl) {
    try {
      const url = new URL(
        values.websiteUrl.startsWith("http")
          ? values.websiteUrl
          : `https://${values.websiteUrl}`,
      );
      if (!url.hostname) return "Website URL is not valid.";
    } catch {
      return "Website URL is not valid.";
    }
  }

  return null;
}

export function toBrandRow(values: BrandFormValues, options?: { isDraft?: boolean }) {
  const businessName =
    values.businessName.trim() ||
    (options?.isDraft ? DRAFT_PLACEHOLDER_BUSINESS_NAME : "");

  return {
    business_name: businessName,
    tagline: values.tagline,
    description: values.description,
    industry: values.industry,
    category: values.category,
    website_url: values.websiteUrl,
    contact_email: values.contactEmail,
    contact_phone: values.contactPhone,
    investment_min: values.investmentMin,
    investment_max: values.investmentMax,
    franchise_fee: values.franchiseFee,
    space_required_sqft: values.spaceRequiredSqft,
    roi_percent: values.roiPercent,
    payback_period_months: values.paybackPeriodMonths,
    franchise_models: values.franchiseModels,
    current_outlets: values.currentOutlets,
    existing_cities: values.existingCities,
    target_cities: values.targetCities,
    expansion_tier_1: values.expansionTier1,
    expansion_tier_2: values.expansionTier2,
    expansion_metro: values.expansionMetro,
    agreement_term_years: values.agreementTermYears,
    lock_in_period_months: values.lockInPeriodMonths,
  };
}
