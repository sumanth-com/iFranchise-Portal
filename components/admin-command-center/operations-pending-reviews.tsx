"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Check, Eye } from "lucide-react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { approveBrand } from "@/lib/admin/actions";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { fadeUp, staggerContainer, staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AdminBrandListItem } from "@/types/admin";
import { initialAdminActionState } from "@/types/admin";

type OperationsPendingReviewsProps = {
  brands: AdminBrandListItem[];
};

function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function OperationsPendingReviews({
  brands,
}: OperationsPendingReviewsProps) {
  const [state, approveAction, approving] = useActionState(
    approveBrand,
    initialAdminActionState,
  );

  return (
    <motion.section
      id="pending-reviews"
      {...fadeUp}
      className="scroll-mt-20 overflow-hidden rounded-2xl border border-violet-100/80 bg-white shadow-sm ring-1 ring-violet-50"
    >
      <div className="border-b border-violet-100/80 bg-gradient-to-r from-violet-50/80 via-white to-purple-50/40 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-600">
              Priority
            </p>
            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              Brands awaiting decision
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              {brands.length === 0
                ? "You're all caught up — no pending reviews."
                : `${brands.length} listing${brands.length === 1 ? "" : "s"} need action`}
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
        <div className="mt-3">
          <AuthAlert error={state.error} message={state.message} />
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {brands.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-violet-200 bg-violet-50/30 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">Queue is clear</p>
            <p className="mt-1 text-xs text-slate-400">
              New submissions will show up here first.
            </p>
          </div>
        ) : (
          <motion.ul
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {brands.map((brand) => {
              const submitted =
                formatRelativeTime(brand.submitted_at ?? brand.created_at) ??
                "Recently";

              return (
                <motion.li
                  key={brand.id}
                  variants={staggerItem}
                  className="group rounded-xl border border-slate-200/80 bg-gradient-to-r from-white to-violet-50/20 p-4 transition-all hover:border-violet-200 hover:shadow-md"
                >
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm ring-1 ring-violet-100">
                      {brand.logo_url ? (
                        <Image
                          src={brand.logo_url}
                          alt=""
                          fill
                          unoptimized
                          className="object-contain p-1"
                          sizes="48px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-violet-600 to-purple-600 text-xs font-bold text-white">
                          {brandInitials(brand.business_name)}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 group-hover:text-violet-700">
                        {brand.business_name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {brand.owner_name ?? brand.owner_email}
                        {brand.industry ? (
                          <span className="text-slate-300"> · </span>
                        ) : null}
                        {brand.industry ? (
                          <span className="capitalize">{brand.industry}</span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Submitted {submitted}
                        {formatDate(brand.submitted_at ?? brand.created_at)
                          ? ` · ${formatDate(brand.submitted_at ?? brand.created_at)}`
                          : ""}
                      </p>
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
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
                          disabled={approving}
                          className={cn(
                            "bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700",
                          )}
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          {approving ? "..." : "Approve"}
                        </Button>
                      </form>
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </motion.ul>
        )}
      </div>
    </motion.section>
  );
}
