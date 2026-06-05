"use client";

import { AnimatePresence, motion } from "framer-motion";
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
import type { Brand } from "@/types/brand";
import {
  initialBrandActionState,
  isBrandEditable,
} from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

const STEPS: Step[] = [
  { id: "business", title: "Business", description: "Core details" },
  { id: "contact", title: "Contact", description: "Reach you" },
  { id: "story", title: "Description", description: "Your narrative" },
  { id: "assets", title: "Assets", description: "Logo & gallery" },
  { id: "review", title: "Review", description: "Submit" },
];

type BrandProfileWizardProps = {
  brand: Brand | null;
  loadError?: string | null;
  assets: BrandAssetsBundle;
  assetsError?: string | null;
};

export function BrandProfileWizard({
  brand,
  loadError,
  assets,
  assetsError,
}: BrandProfileWizardProps) {
  const editable = !loadError && (!brand || isBrandEditable(brand.status));
  const [step, setStep] = useState(0);
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
    if (pendingContinue && draftState.message && !draftState.error) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      setPendingContinue(false);
    }
    if (pendingContinue && draftState.error) {
      setPendingContinue(false);
    }
  }, [draftState, pendingContinue]);

  const handleContinue = () => {
    if (step < 2 || step === 3) {
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
      return;
    }
    setPendingContinue(true);
    saveDraftRef.current?.click();
  };

  return (
    <Card id="profile" className="relative scroll-mt-24" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Brand profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editable
              ? "Five steps to launch on iFranchise — progress saves as you go."
              : "Your profile is locked while under review."}
          </p>
        </div>
        {brand ? <BrandStatusBadge status={brand.status} /> : null}
      </div>

      {brand?.admin_feedback && brand.status === "changes_requested" ? (
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-semibold">Admin feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{brand.admin_feedback}</p>
        </div>
      ) : null}

      <div className="mt-6" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      {editable ? (
        <div className="mt-8">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      ) : null}

      {isPending ? (
        <div className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-card)] bg-white/70 backdrop-blur-[2px]" />
      ) : null}

      <form className="mt-8">
        <div className={step === 0 ? "block" : "hidden"}>
          <motion.div
            key="business"
            initial={false}
            animate={{ opacity: step === 0 ? 1 : 0 }}
            className="space-y-5"
          >
              <div className="space-y-2">
                <Label htmlFor="businessName">Business name</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  defaultValue={brand?.business_name ?? ""}
                  required
                  disabled={!editable || isPending}
                  placeholder="Your franchise name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  defaultValue={brand?.tagline ?? ""}
                  disabled={!editable || isPending}
                  placeholder="A short memorable phrase"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  defaultValue={brand?.industry ?? ""}
                  disabled={!editable || isPending}
                  placeholder="e.g. Food & beverage"
                />
              </div>
            </motion.div>
        </div>

        <div className={step === 1 ? "block" : "hidden"}>
          <motion.div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  defaultValue={brand?.website_url ?? ""}
                  disabled={!editable || isPending}
                  placeholder="https://yourbrand.com"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact email</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={brand?.contact_email ?? ""}
                    disabled={!editable || isPending}
                    placeholder="hello@brand.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact phone</Label>
                  <Input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    defaultValue={brand?.contact_phone ?? ""}
                    disabled={!editable || isPending}
                    placeholder="+1 555 0100"
                  />
                </div>
              </div>
            </motion.div>
        </div>

        <div className={step === 2 ? "block" : "hidden"}>
          <motion.div className="space-y-2">
              <Label htmlFor="description">Brand description</Label>
              <Textarea
                id="description"
                name="description"
                rows={8}
                defaultValue={brand?.description ?? ""}
                disabled={!editable || isPending}
                placeholder="Tell your franchise story — model, markets, and what makes you unique."
              />
              <p className="text-xs text-slate-500">
                Published on the iFranchise marketplace when approved.
              </p>
            </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {step === 3 && (
            <motion.div
              key="assets"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="space-y-8"
            >
              {brand ? (
                <>
                  {assetsError ? (
                    <p className="text-sm text-red-700">{assetsError}</p>
                  ) : null}
                  <LogoUploader
                    brandId={brand.id}
                    logo={assets.logo}
                    editable={editable}
                  />
                  <GalleryUploader
                    brandId={brand.id}
                    gallery={assets.gallery}
                    editable={editable}
                  />
                </>
              ) : (
                <p className="rounded-2xl bg-primary-50 px-4 py-6 text-center text-sm text-primary-800">
                  Save your business details first (Continue through steps 1–3),
                  then return here to upload assets.
                </p>
              )}
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="review"
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.3, ease: easeOut }}
              className="space-y-6"
            >
              <div className="rounded-2xl bg-primary-50 p-5 ring-1 ring-primary-100">
                <div className="flex items-center gap-2 text-primary-700">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="font-semibold">Ready to submit?</p>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  Review your details below. After submission, edits lock until
                  an admin requests changes.
                </p>
              </div>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <SummaryItem label="Business" value={brand?.business_name} />
                <SummaryItem label="Industry" value={brand?.industry} />
                <SummaryItem label="Email" value={brand?.contact_email} />
                <SummaryItem label="Logo" value={assets.logo ? "Uploaded" : "Missing"} />
                <SummaryItem
                  label="Gallery"
                  value={`${assets.gallery.length} image(s)`}
                />
              </dl>
              {brand?.submitted_at ? (
                <p className="text-xs text-slate-500">
                  Last submitted {formatDateTime(brand.submitted_at)}
                </p>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>

        {editable ? (
          <div className="sticky bottom-24 z-10 mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-white/95 p-4 shadow-[var(--shadow-md)] backdrop-blur-md sm:static sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none lg:bottom-0">
            {step > 0 ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setStep((s) => s - 1)}
                disabled={isPending}
              >
                Back
              </Button>
            ) : (
              <div className="hidden flex-1 sm:block" />
            )}

            {!isLastStep ? (
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isPending || pendingContinue}
                className="flex-1 sm:ml-auto sm:flex-none"
              >
                {pendingContinue ? "Saving..." : "Continue"}
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  formAction={saveDraftAction}
                  disabled={isPending}
                >
                  {isSavingDraft ? "Saving..." : "Save draft"}
                </Button>
                <Button type="submit" formAction={submitAction} disabled={isPending}>
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                </Button>
              </>
            )}

            <button
              ref={saveDraftRef}
              type="submit"
              formAction={saveDraftAction}
              className="sr-only"
              tabIndex={-1}
              aria-hidden
            >
              Save
            </button>

            {!isLastStep ? (
              <Button
                type="submit"
                variant="ghost"
                formAction={saveDraftAction}
                disabled={isPending}
              >
                {isSavingDraft ? "Saving..." : "Save draft"}
              </Button>
            ) : null}
          </div>
        ) : null}
      </form>
    </Card>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-xl bg-surface-muted px-3 py-2">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 font-medium text-foreground">{value?.trim() || "—"}</dd>
    </div>
  );
}
