"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Check, Eye, X } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { approveBrand, rejectBrand } from "@/lib/admin/actions";
import { formatDate } from "@/lib/format-date";
import { fadeUp } from "@/lib/motion";
import type { AdminBrandListItem } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

type OperationsPendingReviewsProps = {
  brands: AdminBrandListItem[];
};

export function OperationsPendingReviews({
  brands,
}: OperationsPendingReviewsProps) {
  const [state, approveAction, approving] = useActionState(
    approveBrand,
    initialAdminActionState,
  );
  const [rejectState, rejectAction, rejecting] = useActionState(
    rejectBrand,
    initialAdminActionState,
  );

  const busy = approving || rejecting;
  const alertError = state.error ?? rejectState.error;
  const alertMessage = state.message ?? rejectState.message;

  return (
    <motion.section
      id="pending-reviews"
      {...fadeUp}
      className="scroll-mt-20 rounded-2xl border border-slate-200/80 bg-white shadow-sm"
    >
      <div className="border-b border-slate-100 p-6 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-600">
              Review Queue
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Pending Reviews
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {brands.length} brand{brands.length === 1 ? "" : "s"} awaiting
              decision
            </p>
          </div>
          <Link
            href="/admin/reviews"
            className="inline-flex items-center gap-1 text-sm font-semibold text-violet-600 hover:text-violet-700"
          >
            Full queue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-4">
          <AuthAlert error={alertError} message={alertMessage} />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-6 py-3">Brand</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                  No brands pending review.
                </td>
              </tr>
            ) : (
              brands.map((brand) => (
                <tr
                  key={brand.id}
                  className="border-b border-slate-50 hover:bg-slate-50/60"
                >
                  <td className="px-6 py-4 font-medium text-slate-900">
                    {brand.business_name}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {brand.owner_name ?? brand.owner_email}
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {brand.industry ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-slate-500">
                    {formatDate(brand.submitted_at ?? brand.created_at) ?? "—"}
                  </td>
                  <td className="px-4 py-4">
                    <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                      Pending
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/brands/${brand.id}`}>
                        <Button type="button" variant="secondary" size="sm">
                          <Eye className="mr-1 h-3.5 w-3.5" />
                          Review
                        </Button>
                      </Link>
                      <form action={approveAction}>
                        <input type="hidden" name="brandId" value={brand.id} />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={busy}
                          className="min-w-[88px]"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          {approving ? "..." : "Approve"}
                        </Button>
                      </form>
                      <form action={rejectAction}>
                        <input type="hidden" name="brandId" value={brand.id} />
                        <input
                          type="hidden"
                          name="adminFeedback"
                          value="Does not meet listing requirements."
                        />
                        <Button
                          type="submit"
                          variant="danger"
                          size="sm"
                          disabled={busy}
                        >
                          <X className="mr-1 h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.section>
  );
}
