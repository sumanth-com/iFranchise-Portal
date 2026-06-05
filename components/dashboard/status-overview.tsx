"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { Card } from "@/components/ui/card";
import { ONBOARDING_STEPS, isBrandEditable } from "@/types/brand";
import type { Brand } from "@/types/brand";

type StatusOverviewProps = {
  brand: Brand | null;
  completion: number;
};

export function StatusOverview({ brand, completion }: StatusOverviewProps) {
  const editable = brand ? isBrandEditable(brand.status) : true;
  const steps = ONBOARDING_STEPS.map((s) => s.title);
  const filledSteps = Math.round((completion / 100) * steps.length);

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
            <span className="font-bold text-primary-600">{completion}%</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-100">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#6D28D9] to-[#A78BFA]"
              initial={{ width: 0 }}
              animate={{ width: `${completion}%` }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </div>
        </div>
      </div>

      <div className="hidden gap-1 overflow-x-auto px-4 py-4 sm:flex sm:px-6">
        {steps.map((step, i) => (
          <div key={step} className="flex min-w-[72px] flex-1 flex-col items-center gap-2">
            <div
              className={`h-2 w-full max-w-[48px] rounded-full transition-colors ${
                i < filledSteps ? "bg-primary-600" : "bg-slate-200"
              }`}
            />
            <span
              className={`text-center text-[10px] font-medium leading-tight ${
                i < filledSteps ? "text-primary-700" : "text-slate-400"
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
            href="/dashboard/onboarding?step=1"
            className="flex-1 rounded-xl bg-primary-600 py-2.5 text-center text-sm font-semibold text-white hover:bg-primary-700 sm:flex-none sm:px-6"
          >
            Continue onboarding
          </Link>
          <Link
            href="/dashboard/onboarding?step=9"
            className="flex-1 rounded-xl border border-border py-2.5 text-center text-sm font-semibold text-foreground hover:bg-primary-50 sm:flex-none sm:px-6"
          >
            Review & submit
          </Link>
        </div>
      ) : null}
    </Card>
  );
}
