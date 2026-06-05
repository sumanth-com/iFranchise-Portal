"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { Card } from "@/components/ui/card";
import { isBrandEditable } from "@/types/brand";
import type { Brand } from "@/types/brand";

const STEPS = ["Business", "Contact", "Story", "Assets", "Review", "Live"];

function getStepIndex(status: Brand["status"], hasBrand: boolean): number {
  if (!hasBrand) return 0;
  switch (status) {
    case "draft":
      return 2;
    case "submitted":
      return 4;
    case "changes_requested":
      return 2;
    case "approved":
      return 5;
    default:
      return 3;
  }
}

type StatusOverviewProps = {
  brand: Brand | null;
};

export function StatusOverview({ brand }: StatusOverviewProps) {
  const stepIndex = getStepIndex(brand?.status ?? "draft", Boolean(brand));
  const editable = brand ? isBrandEditable(brand.status) : true;
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="border-b border-border bg-surface-muted/50 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
              Brand status
            </p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">
              {brand?.business_name ?? "Not started"}
            </h3>
          </div>
          {brand ? (
            <BrandStatusBadge
              status={brand.status}
              pulse={brand.status === "submitted"}
            />
          ) : null}
        </div>
        <div className="mt-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-slate-600">Completion</span>
            <span className="font-bold text-primary-600">{progress}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="hidden gap-1 px-4 py-4 sm:flex sm:px-6">
        {STEPS.map((step, i) => (
          <div key={step} className="flex flex-1 flex-col items-center gap-2">
            <div
              className={`h-2 w-full max-w-[48px] rounded-full transition-colors ${
                i <= stepIndex ? "bg-primary-600" : "bg-slate-200"
              }`}
            />
            <span
              className={`text-[10px] font-medium ${
                i <= stepIndex ? "text-primary-700" : "text-slate-400"
              }`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {editable ? (
        <div className="flex gap-3 border-t border-border px-6 py-4 sm:px-8">
          <Link
            href="#profile"
            className="flex-1 rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700 sm:flex-none sm:px-6"
          >
            Continue
          </Link>
          <Link
            href="#profile"
            className="flex-1 rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-foreground hover:bg-primary-50 sm:flex-none sm:px-6"
          >
            View profile
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
