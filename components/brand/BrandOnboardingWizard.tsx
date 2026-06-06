"use client";

import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { BrandAssetsStep } from "@/components/assets/BrandAssetsStep";
import { AuthAlert } from "@/components/auth/auth-alert";
import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { saveBrandDraft, submitBrandForReview, requestBrandUpdate } from "@/lib/brand/actions";
import { displayBusinessName } from "@/lib/brand/constants";
import {
  calculateWizardProgress,
  countFranchiseModels,
} from "@/lib/brand/wizard-progress";
import {
  hasValidationErrors,
  readWizardFormSummary,
  stepIndexForSubmitError,
  validateSubmitReadiness,
  validateWizardStep,
  type WizardFieldErrors,
  type WizardFormSummary,
} from "@/lib/brand/wizard-validation";
import { formatDateTime } from "@/lib/format-date";
import type { Brand, FranchiseModel } from "@/types/brand";
import {
  BRAND_CREATION_STEPS,
  brandNewPath,
  FRANCHISE_MODEL_OPTIONS,
  isBrandEditable,
  isBrandLocked,
  initialBrandActionState,
} from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

const STEPS: Step[] = BRAND_CREATION_STEPS.map((s) => ({
  id: String(s.id),
  title: s.title,
  description: `Step ${s.id} of ${BRAND_CREATION_STEPS.length}`,
}));

type BrandOnboardingWizardProps = {
  brand: Brand | null;
  loadError?: string | null;
  assets: BrandAssetsBundle;
  assetsError?: string | null;
  initialStep?: number;
  mode?: "create" | "edit";
  brandId?: string | null;
  /** Base path for step navigation when editing, e.g. /dashboard/brands/{id}/edit */
  editBasePath?: string;
};

type SaveStatus = "idle" | "saving" | "draft-saved" | "saved";

export function BrandOnboardingWizard({
  brand,
  loadError,
  assets,
  assetsError,
  initialStep = 1,
  mode = "edit",
  brandId = null,
  editBasePath = "/dashboard/onboarding",
}: BrandOnboardingWizardProps) {
  const router = useRouter();
  const isCreateMode = mode === "create";
  const [localBrandId, setLocalBrandId] = useState<string | null>(
    brand?.id ?? brandId,
  );
  const resolvedBrandId = localBrandId;
  const locked = Boolean(brand && isBrandLocked(brand.status));
  const editable =
    !loadError &&
    !locked &&
    (isCreateMode || Boolean(brand && isBrandEditable(brand.status)));
  const [step, setStep] = useState(
    Math.min(Math.max(initialStep, 1), STEPS.length) - 1,
  );
  const [pendingContinue, setPendingContinue] = useState(false);
  const [isSubmittingNow, setIsSubmittingNow] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [fieldErrors, setFieldErrors] = useState<WizardFieldErrors>({});
  const [reviewSnapshot, setReviewSnapshot] = useState<WizardFormSummary | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(
    brand?.updated_at && isCreateMode && !brandId ? null : brand?.updated_at ?? null,
  );
  const [progressPercent, setProgressPercent] = useState(0);
  const saveDraftRef = useRef<HTMLButtonElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const saveIntentRef = useRef<"draft" | "continue">("draft");
  const progressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [draftState, saveDraftAction, isSavingDraft] = useActionState(
    saveBrandDraft,
    initialBrandActionState,
  );
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitBrandForReview,
    initialBrandActionState,
  );

  const [updateState, updateAction, isRequestingUpdate] = useActionState(
    requestBrandUpdate,
    initialBrandActionState,
  );
  const alertError =
    loadError ?? submitError ?? draftState.error ?? submitState.error ?? updateState.error;
  const alertMessage =
    draftState.message ?? submitState.message ?? updateState.message;
  const isFooterBusy =
    isSavingDraft || isSubmitting || isSubmittingNow || isRequestingUpdate;
  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    if (brand?.id && !localBrandId) {
      setLocalBrandId(brand.id);
    } else if (brandId && !localBrandId) {
      setLocalBrandId(brandId);
    }
  }, [brand?.id, brandId, localBrandId]);

  const refreshProgress = useCallback(() => {
    if (!formRef.current) {
      setProgressPercent(0);
      return;
    }
    setProgressPercent(
      calculateWizardProgress(formRef.current, {
        hasLogo: Boolean(assets.logo),
        hasGallery: assets.gallery.length > 0,
        hasBrochure: assets.documents.length > 0,
        franchiseModelCount: countFranchiseModels(formRef.current),
      }),
    );
  }, [assets.logo, assets.gallery.length, assets.documents.length]);

  const scheduleProgressRefresh = useCallback(() => {
    if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
    progressTimerRef.current = setTimeout(() => refreshProgress(), 600);
  }, [refreshProgress]);

  useEffect(() => {
    refreshProgress();
  }, [step, assets.logo, assets.gallery.length, assets.documents.length, refreshProgress]);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    form.addEventListener("input", scheduleProgressRefresh);
    form.addEventListener("change", scheduleProgressRefresh);
    return () => {
      if (progressTimerRef.current) clearTimeout(progressTimerRef.current);
      form.removeEventListener("input", scheduleProgressRefresh);
      form.removeEventListener("change", scheduleProgressRefresh);
    };
  }, [step, editable, scheduleProgressRefresh]);

  const stepInitializedRef = useRef(false);
  useEffect(() => {
    if (stepInitializedRef.current) return;
    stepInitializedRef.current = true;
    setStep(Math.min(Math.max(initialStep, 1), STEPS.length) - 1);
  }, [initialStep]);

  const buildStepUrl = (nextStep: number, id?: string | null) => {
    const stepNum = Math.min(Math.max(nextStep, 1), STEPS.length);
    if (isCreateMode) {
      return brandNewPath(id ?? resolvedBrandId, stepNum);
    }
    return `${editBasePath}?step=${stepNum}`;
  };

  const syncUrl = (nextStep: number, id?: string | null) => {
    const url = buildStepUrl(nextStep, id ?? resolvedBrandId);
    window.history.replaceState(window.history.state, "", url);
  };

  useEffect(() => {
    if (!draftState.message || draftState.error) {
      if (draftState.error) {
        setSaveStatus("idle");
        setPendingContinue(false);
      }
      return;
    }

    if (draftState.brandId) {
      const createdNewBrand = !resolvedBrandId;
      setLocalBrandId(draftState.brandId);
      if (createdNewBrand) {
        syncUrl(step + 1, draftState.brandId);
      }
    }

    setLastSavedAt(new Date().toISOString());
    setSaveStatus(saveIntentRef.current === "continue" ? "saved" : "draft-saved");

    if (pendingContinue && draftState.message && !draftState.error) {
      const next = Math.min(step + 1, STEPS.length - 1);
      if (step === 1 && next !== 1) {
        router.refresh();
      }
      setStep(next);
      syncUrl(next + 1, draftState.brandId ?? resolvedBrandId);
      setPendingContinue(false);
    }

    const t = setTimeout(() => setSaveStatus("idle"), 3000);
    return () => clearTimeout(t);
  }, [draftState.message, draftState.error, draftState.brandId, pendingContinue, step, resolvedBrandId]);

  useEffect(() => {
    if (submitState.message && !submitState.error && resolvedBrandId) {
      router.push(`/dashboard/brands/${resolvedBrandId}/submitted`);
    }
  }, [submitState.message, submitState.error, resolvedBrandId, router]);

  const goToStep = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), STEPS.length - 1);
    const leavingAssetsStep = step === 1 && clamped !== 1;
    setStep(clamped);
    syncUrl(clamped + 1, resolvedBrandId);
    if (leavingAssetsStep) {
      router.refresh();
    }
    if (clamped === 7 && formRef.current) {
      setReviewSnapshot(readWizardFormSummary(formRef.current));
    }
  };

  useEffect(() => {
    if (step === 7 && formRef.current) {
      setReviewSnapshot(readWizardFormSummary(formRef.current));
    }
  }, [step]);

  const handleSubmitForReview = async () => {
    if (!formRef.current || isSubmittingNow) return;

    const validation = validateSubmitReadiness(formRef.current, {
      hasLogo: Boolean(assets.logo),
    });

    if (!validation.ok) {
      setSubmitError(validation.message);
      setFieldErrors(validation.fieldErrors);
      goToStep(validation.stepIndex);
      return;
    }

    setSubmitError(null);
    setFieldErrors({});
    setIsSubmittingNow(true);
    setSaveStatus("saving");

    const fd = new FormData(formRef.current);

    try {
      const draft = await saveBrandDraft(initialBrandActionState, fd);
      if (draft.error) {
        setSubmitError(draft.error);
        setSaveStatus("idle");
        return;
      }

      if (draft.brandId) {
        setLocalBrandId(draft.brandId);
        if (!fd.has("brandId")) {
          fd.set("brandId", draft.brandId);
        }
      }

      const submit = await submitBrandForReview(initialBrandActionState, fd);
      if (submit.error) {
        setSubmitError(submit.error);
        setSaveStatus("idle");
        const targetStep = stepIndexForSubmitError(submit.error);
        if (targetStep != null) goToStep(targetStep);
        return;
      }

      setSaveStatus("saved");
      setLastSavedAt(new Date().toISOString());
      router.push(`/dashboard/brands/${draft.brandId ?? resolvedBrandId}/submitted`);
    } finally {
      setIsSubmittingNow(false);
    }
  };

  const handleSaveDraft = () => {
    saveIntentRef.current = "draft";
    setSaveStatus("saving");
  };

  const handleContinue = () => {
    if ((step === 1 || step === 6) && !resolvedBrandId) {
      setFieldErrors({
        businessName: "Save Basic Information on step 1 before continuing.",
      });
      setStep(0);
      return;
    }

    if (step === 1) {
      if (formRef.current) {
        const errors = validateWizardStep(step, formRef.current, {
          hasLogo: Boolean(assets.logo),
        });
        setFieldErrors(errors);
        if (hasValidationErrors(errors)) return;
      }
      goToStep(step + 1);
      return;
    }
    if (formRef.current) {
      const errors = validateWizardStep(step, formRef.current);
      setFieldErrors(errors);
      if (hasValidationErrors(errors)) return;
    }
    setPendingContinue(true);
    saveIntentRef.current = "continue";
    setSaveStatus("saving");
    saveDraftRef.current?.click();
  };

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "draft-saved"
        ? "Draft saved ✓"
        : saveStatus === "saved"
          ? "Saved ✓"
          : null;

  return (
    <div className="relative w-full pb-28">
      <Card
        className="relative scroll-mt-24 border-slate-200/80 shadow-[0_4px_24px_rgba(15,23,42,0.06)]"
        padding="none"
      >
        {/* Header */}
        <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/80 to-white px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
                Brand Creation Wizard
              </p>
              <h2 className="mt-1 text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                {isCreateMode
                  ? "Create franchise listing"
                  : brand
                    ? `Edit ${brand.business_name}`
                    : "Edit brand listing"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Complete your franchise profile to publish on the marketplace.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {brand ? <BrandStatusBadge status={brand.status} /> : null}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                {brand?.status === "draft" || isCreateMode ? "Draft" : brand?.status}
              </span>
              {statusLabel ? (
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                  {statusLabel}
                </span>
              ) : null}
            </div>
          </div>

          {editable ? (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-[#6D28D9]">
                  {progressPercent}% complete
                </span>
                {lastSavedAt ? (
                  <span>Last saved {formatDateTime(lastSavedAt)}</span>
                ) : (
                  <span>Not saved yet</span>
                )}
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#4F46E5] transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>

        {editable ? (
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6 sm:py-6">
            <Stepper steps={STEPS} currentStep={step} compact />
          </div>
        ) : null}

        <div className="px-5 py-6 sm:px-6 sm:py-7">
      {brand && locked && brand.reviewed_at ? (
        <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <p className="font-semibold">Approved by iFranchise</p>
          <p className="mt-1">
            Last approved{" "}
            {formatDateTime(brand.reviewed_at) ?? brand.reviewed_at}
          </p>
          <form action={updateAction} className="mt-4">
            <input type="hidden" name="brandId" value={brand.id} />
            <Button type="submit" disabled={isRequestingUpdate} size="sm">
              {isRequestingUpdate ? "Requesting…" : "Request Update"}
            </Button>
          </form>
        </div>
      ) : null}

      {brand?.admin_feedback &&
      (brand.status === "changes_requested" || brand.status === "rejected") ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Reviewer feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{brand.admin_feedback}</p>
        </div>
      ) : null}

      <div className="mt-0" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      <form ref={formRef} className="mt-6">
        {resolvedBrandId ? (
          <input type="hidden" name="brandId" value={resolvedBrandId} />
        ) : null}
        {/* Step 1: Brand Information */}
        <StepPanel active={step === 0}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand name" name="businessName" defaultValue={displayBusinessName(brand?.business_name)} required disabled={!editable} error={fieldErrors.businessName} />
            <Field label="Industry" name="industry" defaultValue={brand?.industry} disabled={!editable} placeholder="e.g. Food & Beverage" error={fieldErrors.industry} />
            <Field label="Category" name="category" defaultValue={brand?.category} disabled={!editable} placeholder="e.g. Quick Service Restaurant" required error={fieldErrors.category} />
            <Field label="Tagline" name="tagline" defaultValue={brand?.tagline} disabled={!editable} />
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={6} defaultValue={brand?.description ?? ""} disabled={!editable} placeholder="Tell your franchise story..." />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Contact email" name="contactEmail" type="email" defaultValue={brand?.contact_email} disabled={!editable} error={fieldErrors.contactEmail} />
            <Field label="Contact phone" name="contactPhone" type="tel" defaultValue={brand?.contact_phone} disabled={!editable} error={fieldErrors.contactPhone} />
          </div>
        </StepPanel>

        {/* Step 3: Investment */}
        <StepPanel active={step === 2}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Investment min (₹)" name="investmentMin" type="number" defaultValue={brand?.investment_min?.toString()} disabled={!editable} required error={fieldErrors.investmentMin} />
            <Field label="Investment max (₹)" name="investmentMax" type="number" defaultValue={brand?.investment_max?.toString()} disabled={!editable} />
            <Field label="Franchise fee (₹)" name="franchiseFee" type="number" defaultValue={brand?.franchise_fee?.toString()} disabled={!editable} required error={fieldErrors.franchiseFee} />
            <Field label="ROI (%)" name="roiPercent" type="number" defaultValue={brand?.roi_percent?.toString()} disabled={!editable} />
            <Field label="Payback period (months)" name="paybackPeriodMonths" type="number" defaultValue={brand?.payback_period_months?.toString()} disabled={!editable} />
          </div>
        </StepPanel>

        {/* Step 4: Franchise Model (+ agreement terms) */}
        <StepPanel active={step === 3}>
          <p className="mb-4 text-sm text-slate-500">Select all models you offer.</p>
          {fieldErrors.franchiseModels ? (
            <p className="mb-3 text-sm font-medium text-red-600">{fieldErrors.franchiseModels}</p>
          ) : null}
          <div className="grid gap-3 sm:grid-cols-2">
            {FRANCHISE_MODEL_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 hover:bg-surface-muted">
                <input
                  type="checkbox"
                  name="franchiseModels"
                  value={opt.value}
                  defaultChecked={brand?.franchise_models?.includes(opt.value as FranchiseModel)}
                  disabled={!editable}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600"
                />
                <span>
                  <span className="font-semibold text-foreground">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-6 grid gap-5 border-t border-slate-100 pt-6 sm:grid-cols-2">
            <Field label="Agreement term (years)" name="agreementTermYears" type="number" defaultValue={brand?.agreement_term_years?.toString()} disabled={!editable} />
            <Field label="Lock-in period (months)" name="lockInPeriodMonths" type="number" defaultValue={brand?.lock_in_period_months?.toString()} disabled={!editable} />
            <Field label="Space required (sq ft)" name="spaceRequiredSqft" type="number" defaultValue={brand?.space_required_sqft?.toString()} disabled={!editable} />
          </div>
        </StepPanel>

        {/* Step 5: Locations */}
        <StepPanel active={step === 4}>
          <div className="space-y-5">
            <Field label="Current outlets" name="currentOutlets" type="number" defaultValue={brand?.current_outlets?.toString()} disabled={!editable} />
            <CityField label="Existing cities" name="existingCities" defaultValue={brand?.existing_cities?.join(", ")} disabled={!editable} />
          </div>
        </StepPanel>

        {/* Step 6: Expansion */}
        <StepPanel active={step === 5}>
          <div className="space-y-5">
            <CityField label="Target cities" name="targetCities" defaultValue={brand?.target_cities?.join(", ")} disabled={!editable} />
            <CityField label="Tier 1 cities" name="expansionTier1" defaultValue={brand?.expansion_tier_1?.join(", ")} disabled={!editable} />
            <CityField label="Tier 2 cities" name="expansionTier2" defaultValue={brand?.expansion_tier_2?.join(", ")} disabled={!editable} />
            <CityField label="Metro cities" name="expansionMetro" defaultValue={brand?.expansion_metro?.join(", ")} disabled={!editable} />
          </div>
        </StepPanel>

        {/* Step 7: Documents — brochure uploaded on Brand Assets (step 2) */}
        <StepPanel active={step === 6}>
          {resolvedBrandId ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Upload your logo, gallery images, and franchise brochure on{" "}
                <strong>Brand Assets</strong> (step 2). They are saved automatically
                when uploaded.
              </p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryItem label="Logo" value={assets.logo ? "Uploaded" : "Missing — required"} />
                <SummaryItem
                  label="Gallery images"
                  value={`${assets.gallery.length} image(s)`}
                />
                <SummaryItem
                  label="Brochure PDF"
                  value={
                    assets.documents[0]
                      ? assets.documents[0].file_name
                      : "Not uploaded (optional)"
                  }
                />
              </dl>
              {fieldErrors.brochure ? (
                <p className="text-sm font-medium text-red-600">{fieldErrors.brochure}</p>
              ) : null}
            </div>
          ) : (
            <p className="rounded-2xl bg-primary-50 px-4 py-6 text-center text-sm text-primary-800">
              Complete Basic Information and save, then upload assets on step 2.
            </p>
          )}
        </StepPanel>

        {/* Step 8: Review */}
        <StepPanel active={step === 7}>
          <div className="space-y-6">
            <div className="rounded-2xl bg-primary-50 p-5 ring-1 ring-primary-100">
              <div className="flex items-center gap-2 text-primary-700">
                <CheckCircle2 className="h-5 w-5" />
                <p className="font-semibold">Ready to submit for review?</p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                Our team will review your submission. You will be notified when approved.
              </p>
            </div>
            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <SummaryItem
                label="Brand"
                value={
                  reviewSnapshot?.businessName ||
                  displayBusinessName(brand?.business_name) ||
                  brand?.business_name
                }
              />
              <SummaryItem
                label="Industry"
                value={reviewSnapshot?.industry ?? brand?.industry}
              />
              <SummaryItem
                label="Category"
                value={reviewSnapshot?.category ?? brand?.category}
                highlight={!reviewSnapshot?.category && !brand?.category}
              />
              <SummaryItem
                label="Investment min"
                value={
                  reviewSnapshot?.investmentMin != null
                    ? `₹${reviewSnapshot.investmentMin}`
                    : brand?.investment_min != null
                      ? `₹${brand.investment_min}`
                      : null
                }
                highlight={reviewSnapshot?.investmentMin == null && brand?.investment_min == null}
              />
              <SummaryItem
                label="Franchise models"
                value={
                  reviewSnapshot?.franchiseModels ||
                  brand?.franchise_models?.join(", ")
                }
                highlight={
                  !reviewSnapshot?.franchiseModels &&
                  !(brand?.franchise_models?.length ?? 0)
                }
              />
              <SummaryItem label="Logo" value={assets.logo ? "Uploaded" : "Missing"} />
              <SummaryItem label="Documents" value={`${assets.documents.length} file(s)`} />
            </dl>
            {!reviewSnapshot?.category && !brand?.category ? (
              <p className="text-sm text-amber-800">
                Category is missing — go to <strong>Basic Information</strong> (step 1) to
                add it, then click <strong>Save Draft</strong> or submit again.
              </p>
            ) : null}
            {brand?.submitted_at ? (
              <p className="text-xs text-slate-500">
                Last submitted {formatDateTime(brand.submitted_at)}
              </p>
            ) : null}
          </div>
        </StepPanel>

        {editable ? (
          <div className="fixed bottom-20 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 px-4 py-3 shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-md lg:bottom-0 lg:left-[var(--sidebar-width,16rem)]">
            <div className="mx-auto flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              {step > 0 ? (
                <Button type="button" variant="secondary" onClick={() => goToStep(step - 1)} disabled={isFooterBusy}>
                  Previous
                </Button>
              ) : (
                <div className="hidden flex-1 sm:block" />
              )}

              <div className="flex flex-1 flex-col gap-2 sm:ml-auto sm:flex-row sm:justify-end">
                <Button
                  type="submit"
                  variant="secondary"
                  formAction={saveDraftAction}
                  disabled={isFooterBusy}
                  onClick={handleSaveDraft}
                >
                  {isSavingDraft && saveIntentRef.current === "draft"
                    ? "Saving…"
                    : "Save Draft"}
                </Button>

                {!isLastStep ? (
                  <Button
                    type="button"
                    onClick={handleContinue}
                    disabled={isFooterBusy || pendingContinue}
                  >
                    {pendingContinue || (isSavingDraft && saveIntentRef.current === "continue")
                      ? "Saving…"
                      : "Save & Continue"}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={handleSubmitForReview}
                    disabled={isFooterBusy}
                  >
                    {isSubmittingNow || isSubmitting ? "Submitting…" : "Submit for Review"}
                  </Button>
                )}

                {!isLastStep ? (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      if (formRef.current) {
                        const errors = validateWizardStep(step, formRef.current, {
                          hasLogo: Boolean(assets.logo),
                        });
                        setFieldErrors(errors);
                        if (hasValidationErrors(errors)) return;
                      }
                      goToStep(step + 1);
                    }}
                    disabled={isFooterBusy}
                  >
                    Next Step
                  </Button>
                ) : null}
              </div>

              <button ref={saveDraftRef} type="submit" formAction={saveDraftAction} className="sr-only" tabIndex={-1} aria-hidden>
                Save
              </button>
            </div>
          </div>
        ) : null}
      </form>

      {step === 1 ? (
        <div className="mt-6">
          {resolvedBrandId ? (
            <BrandAssetsStep
              brandId={resolvedBrandId}
              assets={assets}
              editable={editable}
              assetsError={assetsError}
              logoError={fieldErrors.logo}
            />
          ) : (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-6 text-center text-sm text-amber-900">
              Save Basic Information on step 1 first, then return here to upload your
              logo, gallery, and brochure.
            </p>
          )}
        </div>
      ) : null}
        </div>
      </Card>
    </div>
  );
}

function StepPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <div className={active ? undefined : "hidden"} aria-hidden={!active}>
      {children}
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  disabled,
  required,
  type = "text",
  placeholder,
  error,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  placeholder?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={error ? "border-red-300 ring-1 ring-red-200 focus-visible:ring-red-300" : undefined}
      />
      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}
    </div>
  );
}

function CityField({ label, name, defaultValue, disabled }: { label: string; name: string; defaultValue?: string; disabled?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} defaultValue={defaultValue ?? ""} disabled={disabled} placeholder="Mumbai, Delhi, Bangalore" />
      <p className="text-xs text-slate-500">Comma-separated city names</p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string | null | undefined;
  highlight?: boolean;
}) {
  const empty = !value?.trim();
  return (
    <div
      className={`rounded-xl px-3 py-2 ${
        highlight || empty
          ? "bg-amber-50 ring-1 ring-amber-200"
          : "bg-surface-muted"
      }`}
    >
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value?.trim() || "—"}</dd>
    </div>
  );
}
