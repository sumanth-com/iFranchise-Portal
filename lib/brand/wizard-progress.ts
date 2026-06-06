/** Progress based on entered data — 0% when empty, not step position. */

type ProgressExtras = {
  hasLogo: boolean;
  hasGallery: boolean;
  hasBrochure: boolean;
  franchiseModelCount: number;
};

function fieldFilled(form: FormData, name: string): boolean {
  return String(form.get(name) ?? "").trim().length > 0;
}

function cityFilled(form: FormData, name: string): boolean {
  return fieldFilled(form, name);
}

export function calculateWizardProgress(
  form: HTMLFormElement | null,
  extras: ProgressExtras,
): number {
  if (!form) return 0;

  const fd = new FormData(form);
  const checks: boolean[] = [
    fieldFilled(fd, "businessName"),
    fieldFilled(fd, "industry"),
    fieldFilled(fd, "category"),
    fieldFilled(fd, "tagline"),
    fieldFilled(fd, "description"),
    fieldFilled(fd, "contactEmail"),
    fieldFilled(fd, "contactPhone"),
    extras.hasLogo,
    extras.hasGallery,
    fieldFilled(fd, "investmentMin"),
    fieldFilled(fd, "investmentMax"),
    fieldFilled(fd, "franchiseFee"),
    fieldFilled(fd, "roiPercent"),
    fieldFilled(fd, "paybackPeriodMonths"),
    extras.franchiseModelCount > 0,
    fieldFilled(fd, "agreementTermYears"),
    fieldFilled(fd, "lockInPeriodMonths"),
    fieldFilled(fd, "spaceRequiredSqft"),
    fieldFilled(fd, "currentOutlets"),
    cityFilled(fd, "existingCities"),
    cityFilled(fd, "targetCities"),
    cityFilled(fd, "expansionTier1"),
    cityFilled(fd, "expansionTier2"),
    cityFilled(fd, "expansionMetro"),
    extras.hasBrochure,
  ];

  const filled = checks.filter(Boolean).length;
  if (filled === 0) return 0;

  return Math.min(100, Math.round((filled / checks.length) * 100));
}

export function countFranchiseModels(form: HTMLFormElement | null): number {
  if (!form) return 0;
  return new FormData(form).getAll("franchiseModels").length;
}
