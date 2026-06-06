import { parseBrandFormData } from "@/lib/brand/validation";

export type WizardFieldErrors = Record<string, string>;

export type WizardFormSummary = {
  businessName: string;
  industry: string | null;
  category: string | null;
  investmentMin: number | null;
  franchiseModels: string;
  contactEmail: string | null;
};

export type SubmitValidationResult =
  | { ok: true; values: ReturnType<typeof parseBrandFormData> }
  | { ok: false; stepIndex: number; fieldErrors: WizardFieldErrors; message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[\d\s+\-()]{7,20}$/;

export function validateWizardStep(
  step: number,
  form: HTMLFormElement,
  options?: { hasLogo?: boolean; hasBrochure?: boolean },
): WizardFieldErrors {
  const fd = new FormData(form);
  const errors: WizardFieldErrors = {};

  if (step === 0) {
    const businessName = String(fd.get("businessName") ?? "").trim();
    const industry = String(fd.get("industry") ?? "").trim();
    const contactEmail = String(fd.get("contactEmail") ?? "").trim();
    const contactPhone = String(fd.get("contactPhone") ?? "").trim();

    if (!businessName) errors.businessName = "Brand name is required.";
    if (!industry) errors.industry = "Industry is required.";
    if (contactEmail && !EMAIL_RE.test(contactEmail)) {
      errors.contactEmail = "Contact email is invalid.";
    }
    if (contactPhone && !PHONE_RE.test(contactPhone)) {
      errors.contactPhone = "Phone number is invalid.";
    }
  }

  if (step === 1) {
    if (options?.hasLogo === false) {
      errors.logo = "Brand logo is required.";
    }
  }

  if (step === 6) {
    // Brochure is optional; uploaded on Brand Assets (step 2).
  }

  return errors;
}

export function hasValidationErrors(errors: WizardFieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

export function readWizardFormSummary(form: HTMLFormElement): WizardFormSummary {
  const values = parseBrandFormData(new FormData(form));
  return {
    businessName: values.businessName,
    industry: values.industry,
    category: values.category,
    investmentMin: values.investmentMin,
    franchiseModels: values.franchiseModels.join(", "),
    contactEmail: values.contactEmail,
  };
}

/** Client-side submit checks — navigates user to the first incomplete step. */
export function validateSubmitReadiness(
  form: HTMLFormElement,
  options?: { hasLogo?: boolean },
): SubmitValidationResult {
  const values = parseBrandFormData(new FormData(form));
  const errors: WizardFieldErrors = {};

  if (!values.businessName) errors.businessName = "Brand name is required.";
  if (!values.industry) errors.industry = "Industry is required.";
  if (!values.category) errors.category = "Category is required.";
  if (!values.description) errors.description = "Description is required.";
  if (!values.contactEmail) errors.contactEmail = "Contact email is required.";
  else if (!EMAIL_RE.test(values.contactEmail)) {
    errors.contactEmail = "Contact email is invalid.";
  }

  if (options?.hasLogo === false) {
    errors.logo = "Brand logo is required.";
  }

  if (values.investmentMin == null) {
    errors.investmentMin = "Investment minimum is required.";
  }
  if (values.franchiseFee == null) {
    errors.franchiseFee = "Franchise fee is required.";
  }
  if (values.franchiseModels.length === 0) {
    errors.franchiseModels = "Select at least one franchise model.";
  }

  if (Object.keys(errors).length === 0) {
    return { ok: true, values };
  }

  const stepIndex = resolveStepForErrors(errors);
  const message =
    Object.values(errors)[0] ??
    "Complete all required fields before submitting.";

  return { ok: false, stepIndex, fieldErrors: errors, message };
}

function resolveStepForErrors(errors: WizardFieldErrors): number {
  if (errors.logo) return 1;
  if (
    errors.investmentMin ||
    errors.investmentMax ||
    errors.franchiseFee
  ) {
    return 2;
  }
  if (errors.franchiseModels) return 3;
  if (
    errors.currentOutlets ||
    errors.existingCities
  ) {
    return 4;
  }
  if (
    errors.targetCities ||
    errors.expansionTier1
  ) {
    return 5;
  }
  return 0;
}

export function stepIndexForSubmitError(message: string): number | null {
  const lower = message.toLowerCase();
  if (lower.includes("logo")) return 1;
  if (lower.includes("investment") || lower.includes("franchise fee")) return 2;
  if (lower.includes("franchise model")) return 3;
  if (lower.includes("category") || lower.includes("description") || lower.includes("industry") || lower.includes("email")) {
    return 0;
  }
  return null;
}
