"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";

import { BrandHealthWidget } from "@/components/dashboard/client/brand-health-widget";
import { BrandStatsCards } from "@/components/dashboard/client/brand-stats-cards";
import { SubmissionTimeline } from "@/components/dashboard/client/submission-timeline";
import type { BrandHealthSummary } from "@/lib/dashboard/brand-health";
import type { BrandPortfolioStats } from "@/lib/dashboard/brand-stats";
import { buildSubmissionTimeline } from "@/lib/dashboard/timeline";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";
import type { TimelineEvent } from "@/lib/dashboard/timeline";

type PortalDashboardHomeProps = {
  name?: string | null;
  stats: BrandPortfolioStats;
  health: BrandHealthSummary;
  brands: Brand[];
  assetsByBrandId: Record<string, BrandAssetsBundle>;
  loadError?: string | null;
};

function buildPortfolioTimeline(
  brands: Brand[],
  assetsByBrandId: Record<string, BrandAssetsBundle>,
): TimelineEvent[] {
  if (brands.length === 0) return [];

  const events: TimelineEvent[] = [];
  for (const brand of brands.slice(0, 3)) {
    const brandEvents = buildSubmissionTimeline(
      brand,
      assetsByBrandId[brand.id] ?? {
        logo: null,
        gallery: [],
        storePhotos: [],
        productPhotos: [],
        documents: [],
      },
    );
    events.push(
      ...brandEvents
        .filter((e) => e.status === "done" || e.status === "current")
        .slice(0, 2)
        .map((e) => ({
          ...e,
          id: `${brand.id}-${e.id}`,
          title: `${brand.business_name}: ${e.title}`,
        })),
    );
  }

  return events
    .sort((a, b) => {
      if (!a.timestamp || !b.timestamp) return 0;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .slice(0, 8);
}

export function PortalDashboardHome({
  name,
  stats,
  health,
  brands,
  assetsByBrandId,
  loadError,
}: PortalDashboardHomeProps) {
  const firstName = name?.trim().split(/\s+/)[0] ?? "there";
  const primaryBrand = brands[0] ?? null;
  const timeline = buildPortfolioTimeline(brands, assetsByBrandId);

  return (
    <div className="space-y-8">
      {loadError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="dash-hero relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#4F46E5] p-6 text-white shadow-[0_20px_60px_rgba(109,40,217,0.35)] sm:p-8"
      >
        <div className="relative z-10 max-w-2xl text-white">
          <p className="dash-hero-eyebrow text-sm font-medium !text-white/85">
            Brand Owner Portal
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight !text-white sm:text-3xl">
            Welcome back, {firstName}
          </h1>
          <p className="dash-hero-subtitle mt-3 text-sm leading-relaxed !text-white/90 sm:text-base">
            Manage your franchise listings and monitor approval progress across
            the iFranchise marketplace.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/dashboard/brands"
              className="dash-hero-btn-primary inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.02]"
            >
              View My Brands
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/dashboard/brands/new"
              className="dash-hero-btn-secondary inline-flex items-center gap-2 rounded-xl border border-white/40 bg-white/10 px-4 py-2.5 text-sm font-semibold !text-white backdrop-blur transition-colors hover:bg-white/20"
            >
              <Plus className="h-4 w-4 !text-white" />
              Create Brand
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 right-20 h-48 w-48 rounded-full bg-indigo-400/20 blur-2xl" />
      </motion.section>

      <BrandStatsCards stats={stats} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <BrandHealthWidget
            health={health}
            brandName={primaryBrand?.business_name}
          />
        </div>
        <div className="lg:col-span-2">
          <SubmissionTimeline events={timeline} compact />
        </div>
      </div>
    </div>
  );
}
