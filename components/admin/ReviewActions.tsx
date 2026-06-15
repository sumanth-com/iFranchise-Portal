"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  MessageSquareWarning,
  Shield,
  XCircle,
} from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import {
  approveBrand,
  rejectBrand,
  requestBrandChanges,
} from "@/lib/admin/actions";
import { cn } from "@/lib/utils";
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
    <section
      id="review-actions"
      className="overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-[0_8px_30px_rgba(124,58,237,0.08)] ring-1 ring-violet-50"
    >
      <div className="border-b border-violet-100 bg-gradient-to-br from-violet-700 via-purple-600 to-indigo-800 px-5 py-5 text-white">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
            <Shield className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-200">
              Admin review
            </p>
            <h2 className="mt-0.5 text-lg font-semibold">Review decision</h2>
            <p className="mt-1 text-sm leading-relaxed text-violet-100/90">
              {canReview
                ? "Approve, request changes, or reject. Approval does not publish to the website."
                : "Actions unlock when the brand is pending review."}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div aria-live="polite">
          <AuthAlert error={alertError} message={alertMessage} />
        </div>

        {canReview ? (
          <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-violet-50/60 p-2 ring-1 ring-violet-100">
            {[
              { icon: CheckCircle2, label: "Approve", color: "text-emerald-600" },
              { icon: MessageSquareWarning, label: "Changes", color: "text-amber-600" },
              { icon: XCircle, label: "Reject", color: "text-rose-600" },
            ].map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-1 rounded-lg bg-white px-2 py-2.5 text-center shadow-sm"
              >
                <Icon className={cn("h-4 w-4", color)} />
                <span className="text-[10px] font-semibold text-slate-600">
                  {label}
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <form className="relative mt-5">
          {isPending ? (
            <div className="pointer-events-none absolute inset-0 z-10 rounded-xl bg-white/60 backdrop-blur-[1px]" />
          ) : null}

          <input type="hidden" name="brandId" value={brand.id} />

          {canReview ? (
            <div className="flex flex-col gap-2.5">
              <Button
                type="submit"
                formAction={approveAction}
                disabled={isPending}
                className="h-11 w-full rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-sm font-semibold shadow-md shadow-violet-200 hover:from-violet-700 hover:to-purple-700"
                id="approve"
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                {isApproving ? "Approving..." : "Approve brand"}
              </Button>
              <Button
                type="submit"
                variant="secondary"
                formAction={requestChangesAction}
                disabled={isPending}
                className="h-11 w-full rounded-xl border-violet-100 bg-white text-sm font-semibold hover:bg-violet-50"
                id="changes"
              >
                <MessageSquareWarning className="mr-2 h-4 w-4 text-amber-600" />
                {isRequestingChanges ? "Sending..." : "Request changes"}
              </Button>
              <Button
                type="submit"
                variant="danger"
                formAction={rejectAction}
                disabled={isPending}
                className="h-11 w-full rounded-xl text-sm font-semibold"
                id="reject"
              >
                <XCircle className="mr-2 h-4 w-4" />
                {isRejecting ? "Rejecting..." : "Reject"}
              </Button>
            </div>
          ) : (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600 ring-1 ring-slate-100"
            >
              This brand is not awaiting a new review decision.
            </motion.p>
          )}
        </form>
      </div>
    </section>
  );
}
