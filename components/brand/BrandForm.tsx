"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useActionState, useState } from "react";

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

const STEPS: Step[] = [
  { id: "identity", title: "Identity", description: "Business basics" },
  { id: "story", title: "Story", description: "Your brand narrative" },
  { id: "contact", title: "Contact", description: "How to reach you" },
];

type BrandFormProps = {
  brand: Brand | null;
  loadError?: string | null;
};

export function BrandForm({ brand, loadError }: BrandFormProps) {
  const editable = !loadError && (!brand || isBrandEditable(brand.status));
  const [step, setStep] = useState(0);
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

  return (
    <Card id="profile" className="relative scroll-mt-24" padding="lg">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground sm:text-xl">
            Brand profile
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {editable
              ? "Complete each step and save your progress anytime."
              : "Your profile is locked while under review."}
          </p>
        </div>
        {brand ? <BrandStatusBadge status={brand.status} /> : null}
      </div>

      {brand?.admin_feedback && brand.status === "changes_requested" ? (
        <div className="mt-6 rounded-[var(--radius-md)] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <p className="font-medium">Admin feedback</p>
          <p className="mt-1 whitespace-pre-wrap">{brand.admin_feedback}</p>
        </div>
      ) : null}

      {brand?.submitted_at ? (
        <p className="mt-4 text-sm text-slate-500">
          Submitted {formatDateTime(brand.submitted_at)}
          {brand.reviewed_at
            ? ` · Reviewed ${formatDateTime(brand.reviewed_at)}`
            : null}
        </p>
      ) : null}

      <div className="mt-6" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      {editable ? (
        <div className="mt-6">
          <Stepper steps={STEPS} currentStep={step} />
        </div>
      ) : null}

      {isPending ? (
        <div
          className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-lg)] bg-white/60"
          aria-hidden
        />
      ) : null}

      <form className="mt-8 space-y-6">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div
              key="step-0"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: easeOut }}
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
                  placeholder="Acme Franchising Co."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  name="tagline"
                  defaultValue={brand?.tagline ?? ""}
                  disabled={!editable || isPending}
                  placeholder="Grow with confidence"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  defaultValue={brand?.industry ?? ""}
                  disabled={!editable || isPending}
                  placeholder="Food & beverage"
                />
              </div>
            </motion.div>
          ) : null}

          {step === 1 ? (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-2"
            >
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={brand?.description ?? ""}
                disabled={!editable || isPending}
                placeholder="Describe your business, franchise model, and what makes your brand unique."
                rows={6}
              />
              <p className="text-xs text-slate-500">
                Shown on the public iFranchise site when approved.
              </p>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.25, ease: easeOut }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="websiteUrl">Website URL</Label>
                <Input
                  id="websiteUrl"
                  name="websiteUrl"
                  type="url"
                  defaultValue={brand?.website_url ?? ""}
                  disabled={!editable || isPending}
                  placeholder="https://example.com"
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
                    placeholder="contact@example.com"
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
          ) : null}
        </AnimatePresence>

        {editable ? (
          <div className="sticky bottom-20 z-10 -mx-2 flex flex-col gap-3 border-t border-border bg-surface/95 p-4 backdrop-blur-sm sm:static sm:mx-0 sm:flex-row sm:border-0 sm:bg-transparent sm:p-0 sm:pt-4 lg:bottom-0">
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
              <div className="hidden sm:block sm:flex-1" />
            )}
            {!isLastStep ? (
              <Button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={isPending}
                className="flex-1 sm:ml-auto sm:flex-none"
              >
                Continue
              </Button>
            ) : (
              <>
                <Button
                  type="submit"
                  variant="secondary"
                  formAction={saveDraftAction}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isSavingDraft ? "Saving..." : "Save draft"}
                </Button>
                <Button
                  type="submit"
                  formAction={submitAction}
                  disabled={isPending}
                  className="flex-1 sm:flex-none"
                >
                  {isSubmitting ? "Submitting..." : "Submit for review"}
                </Button>
              </>
            )}
            {!isLastStep ? (
              <Button
                type="submit"
                variant="ghost"
                formAction={saveDraftAction}
                disabled={isPending}
                className="sm:w-auto"
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
