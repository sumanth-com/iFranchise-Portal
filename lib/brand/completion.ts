import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type CompletionInput = {
  brand: Brand | null;
  assets: BrandAssetsBundle;
  documentCount?: number;
};

function hasText(value: string | null | undefined): boolean {
  return Boolean(value?.trim());
}

function hasNumber(value: number | null | undefined): boolean {
  return value != null && !Number.isNaN(value);
}

export function calculateBrandCompletion({
  brand,
  assets,
  documentCount = 0,
}: CompletionInput): number {
  if (!brand) return 0;

  const checks = [
    hasText(brand.business_name),
    hasText(brand.industry),
    hasText(brand.category),
    hasText(brand.tagline),
    hasText(brand.description),
    Boolean(assets.logo),
    assets.gallery.length > 0,
    hasNumber(brand.investment_min),
    hasNumber(brand.franchise_fee),
    hasNumber(brand.space_required_sqft),
    brand.franchise_models.length > 0,
    hasNumber(brand.current_outlets),
    brand.existing_cities.length > 0,
    brand.target_cities.length > 0,
    hasNumber(brand.agreement_term_years),
    documentCount > 0,
    hasText(brand.contact_email),
  ];

  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}
