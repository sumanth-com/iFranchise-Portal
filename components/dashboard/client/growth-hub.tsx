"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Search,
  Share2,
  Target,
} from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import {
  GROWTH_MODULES,
  GROWTH_QUICK_WINS,
} from "@/lib/content/growth-playbook";
import { cn } from "@/lib/utils";

const MODULE_ICONS = {
  search: Search,
  target: Target,
  share: Share2,
  chart: BarChart3,
} as const;

export function GrowthHub() {
  return (
    <div className="portal-page space-y-6">
      <PortalPageHeader
        eyebrow="Resources"
        title="Growth Hub"
        description="SEO, conversion, and digital marketing playbooks built for franchise brand owners — actionable steps you can apply to your iFranchise listing today."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {GROWTH_MODULES.map((module) => {
          const Icon = MODULE_ICONS[module.icon];
          return (
            <GlassCard key={module.id} padding="lg">
              <span className="dash-on-color flex h-10 w-10 items-center justify-center rounded-xl bg-[#6D28D9]">
                <Icon className="h-5 w-5" />
              </span>
              <h2 className="mt-3 text-base font-semibold text-slate-900">
                {module.title}
              </h2>
              <p className="mt-1 text-sm text-slate-500">{module.subtitle}</p>

              <ul className="mt-4 space-y-3">
                {module.tips.map((tip) => (
                  <li
                    key={tip.id}
                    className="rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {tip.title}
                      </p>
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                          tip.impact === "High"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700",
                        )}
                      >
                        {tip.impact}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
                      {tip.detail}
                    </p>
                  </li>
                ))}
              </ul>

              <Link
                href={module.actionHref}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D28D9] hover:underline"
              >
                {module.actionLabel}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard padding="lg">
        <h2 className="text-base font-semibold text-slate-900">
          Quick wins this week
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Five high-leverage moves from our growth team — no ad budget required.
        </p>
        <ol className="mt-4 space-y-2.5">
          {GROWTH_QUICK_WINS.map((tip, index) => (
            <li key={tip} className="flex gap-3 text-sm text-slate-600">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#F5F3FF] text-xs font-bold text-[#6D28D9]">
                {index + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{tip}</span>
            </li>
          ))}
        </ol>
      </GlassCard>
    </div>
  );
}
