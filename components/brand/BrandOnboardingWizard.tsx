"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

import { GalleryUploader } from "@/components/assets/GalleryUploader";
import { LogoUploader } from "@/components/assets/LogoUploader";
import { AuthAlert } from "@/components/auth/auth-alert";
import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stepper, type Step } from "@/components/ui/stepper";
import { Textarea } from "@/components/ui/textarea";
import { saveBrandDraft, submitBrandForReview } from "@/lib/brand/actions";
import { easeOut } from "@/lib/motion";
import { formatDateTime } from "@/lib/format-date";
import type { Brand, FranchiseModel } from "@/types/brand";
import {
  FRANCHISE_MODEL_OPTIONS,
  ONBOARDING_STEPS,
  initialBrandActionState,
  isBrandEditable,
} from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

const STEPS: Step[] = ONBOARDING_STEPS.map((s) => ({
  id: String(s.id),
  title: s.title,
  description: `Step ${s.id}`,
}));

type BrandOnboardingWizardProps = {
  brand: Brand | null;
  loadError?: string | null;
  assets: BrandAssetsBundle;
  assetsError?: string | null;
  initialStep?: number;
};

export function BrandOnboardingWizard({
  brand,
  loadError,
  assets,
  assetsError,
  initialStep = 1,
}: BrandOnboardingWizardProps) {
  const router = useRouter();
  const editable = !loadError && (!brand || isBrandEditable(brand.status));
  const [step, setStep] = useState(
    Math.min(Math.max(initialStep, 1), STEPS.length) - 1,
  );
  const [pendingContinue, setPendingContinue] = useState(false);
  const saveDraftRef = useRef<HTMLButtonElement>(null);

  const [draftState, saveDraftAction, isSavingDraft] = useActionState(
    saveBrandDraft,
    initialBrandActionState,
  );
  const [submitState, submitAction, isSubmitting] = useActionState(
    submitBrandForReview,
    initialBrandActionState,
  );

  const alertError = loadError ?? draftState.error ?? submitState.error;
  const alertMessage = draftState.message ?? submitState.message;
  const isPending = isSavingDraft || isSubmitting;
  const isLastStep = step === STEPS.length - 1;

  useEffect(() => {
    setStep(Math.min(Math.max(initialStep, 1), STEPS.length) - 1);
  }, [initialStep]);

  useEffect(() => {
    if (pendingContinue && draftState.message && !draftState.error) {
      const next = Math.min(step + 1, STEPS.length - 1);
      setStep(next);
      router.replace(`/dashboard/onboarding?step=${next + 1}`);
      setPendingContinue(false);
    }
    if (pendingContinue && draftState.error) {
      setPendingContinue(false);
    }
  }, [draftState, pendingContinue, router, step]);

  const goToStep = (index: number) => {
    const clamped = Math.min(Math.max(index, 0), STEPS.length - 1);
    setStep(clamped);
    router.replace(`/dashboard/onboarding?step=${clamped + 1}`);
  };

  const handleContinue = () => {
    if (step === 1 || step === 7) {
      goToStep(step + 1);
      return;
    }
    setPendingContinue(true);
    saveDraftRef.current?.click();
  };

  return (
    <Card className="relative scroll-mt-24" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Brand onboarding
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editable
              ? "Nine steps to launch on iFranchise — progress saves as you go."
              : "Your profile is locked while under review."}
          </p>
        </div>
        {brand ? <BrandStatusBadge status={brand.status} /> : null}
      </div>

      {brand?.admin_feedback && brand.status === "changes_requested" ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Reviewer feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{brand.admin_feedback}</p>
        </div>
      ) : null}

      <div className="mt-6" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      {editable ? (
        <div className="mt-8 overflow-x-auto">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      ) : null}

      {isPending ? (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-card)] bg-white/70 backdrop-blur-[2px]" />
      ) : null}

      <form className="mt-8">
        {/* Step 1: Brand Information */}
        <StepPanel active={step === 0}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Brand name" name="businessName" defaultValue={brand?.business_name} required disabled={!editable || isPending} />
            <Field label="Industry" name="industry" defaultValue={brand?.industry} disabled={!editable || isPending} placeholder="e.g. Food & Beverage" />
            <Field label="Category" name="category" defaultValue={brand?.category} disabled={!editable || isPending} placeholder="e.g. Quick Service Restaurant" />
            <Field label="Tagline" name="tagline" defaultValue={brand?.tagline} disabled={!editable || isPending} />
          </div>
          <div className="mt-5 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={6} defaultValue={brand?.description ?? ""} disabled={!editable || isPending} placeholder="Tell your franchise story..." />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Contact email" name="contactEmail" type="email" defaultValue={brand?.contact_email} disabled={!editable || isPending} />
            <Field label="Contact phone" name="contactPhone" type="tel" defaultValue={brand?.contact_phone} disabled={!editable || isPending} />
          </div>
        </StepPanel>

        {/* Step 2: Assets */}
        <StepPanel active={step === 1}>
          {brand ? (
            <div className="space-y-8">
              {assetsError ? <p className="text-sm text-red-700">{assetsError}</p> : null}
              <LogoUploader brandId={brand.id} logo={assets.logo} editable={editable} />
              <GalleryUploader brandId={brand.id} gallery={assets.gallery} editable={editable} label="Gallery images" />
              <GalleryUploader brandId={brand.id} gallery={assets.storePhotos} editable={editable} assetType="store_photo" label="Store photos" />
              <GalleryUploader brandId={brand.id} gallery={assets.productPhotos} editable={editable} assetType="product_photo" label="Product photos" />
            </div>
          ) : (
            <p className="rounded-2xl bg-primary-50 px-4 py-6 text-center text-sm text-primary-800">
              Complete Step 1 and save, then return here to upload assets.
            </p>
          )}
        </StepPanel>

        {/* Step 3: Investment */}
        <StepPanel active={step === 2}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Investment min (₹)" name="investmentMin" type="number" defaultValue={brand?.investment_min?.toString()} disabled={!editable || isPending} />
            <Field label="Investment max (₹)" name="investmentMax" type="number" defaultValue={brand?.investment_max?.toString()} disabled={!editable || isPending} />
            <Field label="Franchise fee (₹)" name="franchiseFee" type="number" defaultValue={brand?.franchise_fee?.toString()} disabled={!editable || isPending} />
            <Field label="Space required (sq ft)" name="spaceRequiredSqft" type="number" defaultValue={brand?.space_required_sqft?.toString()} disabled={!editable || isPending} />
            <Field label="ROI (%)" name="roiPercent" type="number" defaultValue={brand?.roi_percent?.toString()} disabled={!editable || isPending} />
            <Field label="Payback period (months)" name="paybackPeriodMonths" type="number" defaultValue={brand?.payback_period_months?.toString()} disabled={!editable || isPending} />
          </div>
        </StepPanel>

        {/* Step 4: Franchise Model */}
        <StepPanel active={step === 3}>
          <p className="mb-4 text-sm text-slate-500">Select all models you offer.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {FRANCHISE_MODEL_OPTIONS.map((opt) => (
              <label key={opt.value} className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border p-4 hover:bg-surface-muted">
                <input
                  type="checkbox"
                  name="franchiseModels"
                  value={opt.value}
                  defaultChecked={brand?.franchise_models?.includes(opt.value as FranchiseModel)}
                  disabled={!editable || isPending}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600"
                />
                <span>
                  <span className="font-semibold text-foreground">{opt.label}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{opt.description}</span>
                </span>
              </label>
            ))}
          </div>
        </StepPanel>

        {/* Step 5: Network */}
        <StepPanel active={step === 4}>
          <div className="space-y-5">
            <Field label="Current outlets" name="currentOutlets" type="number" defaultValue={brand?.current_outlets?.toString()} disabled={!editable || isPending} />
            <CityField label="Existing cities" name="existingCities" defaultValue={brand?.existing_cities?.join(", ")} disabled={!editable || isPending} />
          </div>
        </StepPanel>

        {/* Step 6: Expansion */}
        <StepPanel active={step === 5}>
          <div className="space-y-5">
            <CityField label="Target cities" name="targetCities" defaultValue={brand?.target_cities?.join(", ")} disabled={!editable || isPending} />
            <CityField label="Tier 1 cities" name="expansionTier1" defaultValue={brand?.expansion_tier_1?.join(", ")} disabled={!editable || isPending} />
            <CityField label="Tier 2 cities" name="expansionTier2" defaultValue={brand?.expansion_tier_2?.join(", ")} disabled={!editable || isPending} />
            <CityField label="Metro cities" name="expansionMetro" defaultValue={brand?.expansion_metro?.join(", ")} disabled={!editable || isPending} />
          </div>
        </StepPanel>

        {/* Step 7: Agreement */}
        <StepPanel active={step === 6}>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Agreement term (years)" name="agreementTermYears" type="number" defaultValue={brand?.agreement_term_years?.toString()} disabled={!editable || isPending} />
            <Field label="Lock-in period (months)" name="lockInPeriodMonths" type="number" defaultValue={brand?.lock_in_period_months?.toString()} disabled={!editable || isPending} />
          </div>
        </StepPanel>

        {/* Step 8: Documents */}
        <StepPanel active={step === 7}>
          {brand ? (
            <GalleryUploader
              brandId={brand.id}
              gallery={assets.documents}
              editable={editable}
              assetType="document"
              label="Franchise brochure & documents (PDF)"
              accept="application/pdf"
            />
          ) : (
            <p className="rounded-2xl bg-primary-50 px-4 py-6 text-center text-sm text-primary-800">
              Save your brand profile first, then upload documents.
            </p>
          )}
        </StepPanel>

        {/* Step 9: Review */}
        <StepPanel active={step === 8}>
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
              <SummaryItem label="Brand" value={brand?.business_name} />
              <SummaryItem label="Industry" value={brand?.industry} />
              <SummaryItem label="Category" value={brand?.category} />
              <SummaryItem label="Investment min" value={brand?.investment_min != null ? `₹${brand.investment_min}` : null} />
              <SummaryItem label="Franchise models" value={brand?.franchise_models?.join(", ")} />
              <SummaryItem label="Logo" value={assets.logo ? "Uploaded" : "Missing"} />
              <SummaryItem label="Documents" value={`${assets.documents.length} file(s)`} />
            </dl>
            {brand?.submitted_at ? (
              <p className="text-xs text-slate-500">
                Last submitted {formatDateTime(brand.submitted_at)}
              </p>
            ) : null}
          </div>
        </StepPanel>

        {editable ? (
          <div className="sticky bottom-24 z-10 mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-white/95 p-4 shadow-[var(--shadow-md)] backdrop-blur-md sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
            {step > 0 ? (
              <Button type="button" variant="secondary" onClick={() => goToStep(step - 1)} disabled={isPending}>
                Back
              </Button>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}

            {!isLastStep ? (
              <Button type="button" onClick={handleContinue} disabled={isPending || pendingContinue} className="flex-1 sm:ml-auto sm:flex-none">
                {pendingContinue ? "Saving..." : "Save & continue"}
              </Button>
            ) : (
              <>
                <Button type="submit" variant="secondary" formAction={saveDraftAction} disabled={isPending}>
                  {isSavingDraft ? "Saving..." : "Save draft"}
                </Button>
                <Button type="submit" formAction={submitAction} disabled={isPending}>
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                </Button>
              </>
            )}

            <button ref={saveDraftRef} type="submit" formAction={saveDraftAction} className="sr-only" tabIndex={-1} aria-hidden>
              Save
            </button>

            {!isLastStep ? (
              <Button type="submit" variant="ghost" formAction={saveDraftAction} disabled={isPending}>
                {isSavingDraft ? "Saving..." : "Save draft"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </form>
    </Card>
  );
}

function StepPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      {active ? (
        <motion.div
          key="panel"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.28, ease: easeOut }}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
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
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  disabled?: boolean;
  required?: boolean;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} disabled={disabled} placeholder={placeholder} />
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

function SummaryItem({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value?.trim() || "—"}</dd>
    </div>
  );
}
