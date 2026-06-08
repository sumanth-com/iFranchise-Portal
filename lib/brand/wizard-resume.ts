import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

const STEP_COUNT = 8;

function isStep1Complete(brand: Brand): boolean {
  const name = brand.business_name?.trim();
  return Boolean(
    name &&
      name !== "Untitled Brand" &&
      brand.industry?.trim() &&
      brand.category?.trim(),
  );
}

function isStep2Complete(assets: BrandAssetsBundle): boolean {
  return Boolean(assets.logo);
}

function isStep3Complete(brand: Brand): boolean {
  return brand.investment_min != null && brand.franchise_fee != null;
}

function isStep4Complete(brand: Brand): boolean {
  return (brand.franchise_models?.length ?? 0) > 0;
}

function isStep5Complete(brand: Brand): boolean {
  return (
    brand.current_outlets != null ||
    (brand.existing_cities?.length ?? 0) > 0
  );
}

function isStep6Complete(brand: Brand): boolean {
  return (
    (brand.target_cities?.length ?? 0) > 0 ||
    (brand.expansion_tier_1?.length ?? 0) > 0 ||
    (brand.expansion_tier_2?.length ?? 0) > 0 ||
    (brand.expansion_metro?.length ?? 0) > 0
  );
}

function isStep7Complete(brand: Brand, assets: BrandAssetsBundle): boolean {
  return isStep2Complete(assets) && isStep1Complete(brand);
}

function isStep8Complete(brand: Brand): boolean {
  return Boolean(brand.submitted_at);
}

const STEP_CHECKS: Array<(brand: Brand, assets: BrandAssetsBundle) => boolean> = [
  isStep1Complete,
  isStep2Complete,
  isStep3Complete,
  isStep4Complete,
  isStep5Complete,
  isStep6Complete,
  isStep7Complete,
  isStep8Complete,
];

/**
 * Highest wizard step (1–8) with saved data complete.
 * Used to resume editing at the user's last finished step.
 */
export function resolveWizardResumeStep(
  brand: Brand,
  assets: BrandAssetsBundle,
): number {
  let lastCompleted = 0;

  for (let i = 0; i < STEP_CHECKS.length; i++) {
    if (STEP_CHECKS[i](brand, assets)) {
      lastCompleted = i + 1;
    }
  }

  return lastCompleted > 0 ? Math.min(lastCompleted, STEP_COUNT) : 1;
}
