"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Clock, Lock, Pencil, Send, RefreshCw } from "lucide-react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import { Button } from "@/components/ui/button";
import {
  requestBrandUpdate,
  submitBrandById,
} from "@/lib/brand/actions";
import { canOwnerEditBrand } from "@/lib/brand/owner-access";
import { brandEditPath } from "@/types/brand";
import type { Brand } from "@/types/brand";
import { initialBrandActionState, isBrandEditable } from "@/types/brand";
import { formatDateTime } from "@/lib/format-date";

type BrandPreviewActionsProps = {
  brand: Brand;
};

export function BrandPreviewActions({ brand }: BrandPreviewActionsProps) {
  const [submitState, submitAction, submitting] = useActionState(
    submitBrandById,
    initialBrandActionState,
  );
  const [updateState, updateAction, updating] = useActionState(
    requestBrandUpdate,
    initialBrandActionState,
  );

  const canEditNow = canOwnerEditBrand(brand);
  const editHref = brandEditPath(brand.id);
  const actionError = submitState.error || updateState.error;
  const actionMessage = submitState.message || updateState.message;

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_4px_24px_rgba(15,23,42,0.06)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
          Submission Status
        </h3>
        <DashboardStatusBadge
          status={brand.status}
          pulse={brand.status === "submitted"}
        />
      </div>

      {actionError ? (
        <p className="mt-3 text-sm text-red-600" role="alert">
          {actionError}
        </p>
      ) : null}
      {actionMessage ? (
        <p className="mt-3 text-sm text-emerald-600">{actionMessage}</p>
      ) : null}

      <div className="mt-5 space-y-4">
        {brand.status === "draft" ? (
          <>
            <p className="text-sm text-slate-600">
              Your listing is a draft. Complete all sections and submit for
              iFranchise review.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#6D28D9] hover:text-[#6D28D9]"
              >
                <Pencil className="h-4 w-4" />
                Edit Listing
              </Link>
              <form action={submitAction}>
                <input type="hidden" name="brandId" value={brand.id} />
                <Button type="submit" disabled={submitting} className="gap-2">
                  <Send className="h-4 w-4" />
                  {submitting ? "Submitting…" : "Submit For Review"}
                </Button>
              </form>
            </div>
          </>
        ) : null}

        {brand.status === "submitted" || brand.status === "changes_requested" ? (
          <>
            {canEditNow ? (
              <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <Clock className="h-4 w-4 shrink-0" />
                You can still edit your listing until review lock activates.
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <Lock className="h-4 w-4 shrink-0 text-slate-500" />
                This listing is currently under review and can no longer be edited.
              </div>
            )}
            {brand.admin_feedback ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
                <p className="font-semibold">Admin feedback</p>
                <p className="mt-1 whitespace-pre-wrap">{brand.admin_feedback}</p>
              </div>
            ) : null}
            {canEditNow ? (
              <Link
                href={editHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9] hover:underline"
              >
                <Pencil className="h-4 w-4" />
                Edit Listing
              </Link>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-amber-900">
                  <Lock className="h-4 w-4" />
                  Review In Progress
                </span>
                <Link
                  href={editHref}
                  className="text-sm font-medium text-slate-600 underline-offset-2 hover:text-[#6D28D9] hover:underline"
                >
                  View submitted listing (read-only)
                </Link>
              </div>
            )}
          </>
        ) : null}

        {brand.status === "approved" ? (
          <>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
              <p className="font-semibold">Approved by iFranchise</p>
              {brand.reviewed_at ? (
                <p className="mt-1">
                  Approval date: {formatDateTime(brand.reviewed_at)}
                </p>
              ) : null}
            </div>
            <form action={updateAction}>
              <input type="hidden" name="brandId" value={brand.id} />
              <Button type="submit" variant="secondary" disabled={updating} className="gap-2">
                <RefreshCw className="h-4 w-4" />
                {updating ? "Requesting…" : "Request Update"}
              </Button>
            </form>
          </>
        ) : null}

        {brand.status === "rejected" ? (
          <>
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              <p className="font-semibold">Required fixes</p>
              <p className="mt-1 whitespace-pre-wrap">
                {brand.admin_feedback ?? "Please review admin comments and update your listing."}
              </p>
            </div>
            {isBrandEditable(brand.status) ? (
              <Link
                href={editHref}
                className="dash-cta-purple inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold !text-white"
              >
                <Pencil className="h-4 w-4 !text-white" />
                Edit & Resubmit
              </Link>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
