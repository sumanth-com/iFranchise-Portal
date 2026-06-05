"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  approveBrand,
  rejectBrand,
  requestBrandChanges,
} from "@/lib/admin/actions";
import type { AdminBrandDetail } from "@/types/admin";
import {
  canAdminReviewBrand,
  initialAdminActionState,
} from "@/types/admin";

type ReviewActionsProps = {
  brand: AdminBrandDetail;
};

export function ReviewActions({ brand }: ReviewActionsProps) {
  const canReview = canAdminReviewBrand(brand.status);
  const [approveState, approveAction, isApproving] = useActionState(
    approveBrand,
    initialAdminActionState,
  );
  const [rejectState, rejectAction, isRejecting] = useActionState(
    rejectBrand,
    initialAdminActionState,
  );
  const [changesState, requestChangesAction, isRequestingChanges] =
    useActionState(requestBrandChanges, initialAdminActionState);

  const isPending = isApproving || isRejecting || isRequestingChanges;
  const alertError =
    approveState.error ?? rejectState.error ?? changesState.error;
  const alertMessage =
    approveState.message ?? rejectState.message ?? changesState.message;

  return (
    <Card className="sticky top-20 lg:top-24" padding="lg">
      <h2 className="text-lg font-semibold text-foreground">Decision</h2>
      <p className="mt-1 text-sm text-slate-500">
        {canReview
          ? "Approve, reject, or request changes with optional feedback."
          : "Actions are available when status is submitted."}
      </p>

      <div className="mt-4" aria-live="polite">
        <AuthAlert error={alertError} message={alertMessage} />
      </div>

      <form className="relative mt-6 space-y-5">
        {isPending ? (
          <div className="pointer-events-none absolute inset-0 z-10 rounded-[var(--radius-lg)] bg-white/50" />
        ) : null}
        <input type="hidden" name="brandId" value={brand.id} />
        <div className="space-y-2">
          <Label htmlFor="adminFeedback">Admin feedback</Label>
          <Textarea
            id="adminFeedback"
            name="adminFeedback"
            rows={5}
            defaultValue={brand.admin_feedback ?? ""}
            disabled={!canReview || isPending}
            placeholder="Notes for the client (required for reject / request changes)"
          />
        </div>

        {canReview ? (
          <div className="flex flex-col gap-3">
            <Button
              type="submit"
              formAction={approveAction}
              disabled={isPending}
              className="w-full"
            >
              {isApproving ? "Approving..." : "Approve brand"}
            </Button>
            <Button
              type="submit"
              variant="secondary"
              formAction={requestChangesAction}
              disabled={isPending}
              className="w-full"
            >
              {isRequestingChanges ? "Sending..." : "Request changes"}
            </Button>
            <Button
              type="submit"
              variant="danger"
              formAction={rejectAction}
              disabled={isPending}
              className="w-full"
            >
              {isRejecting ? "Rejecting..." : "Reject"}
            </Button>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-[var(--radius-md)] bg-surface-muted px-4 py-3 text-sm text-slate-600"
          >
            This brand is not awaiting a new review decision.
          </motion.p>
        )}
      </form>
    </Card>
  );
}
