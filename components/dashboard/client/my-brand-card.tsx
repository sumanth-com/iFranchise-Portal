"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Building2, ExternalLink, Pencil, Eye } from "lucide-react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type MyBrandCardProps = {
  brand: Brand | null;
  assets: BrandAssetsBundle;
};

export function MyBrandCard({ brand, assets }: MyBrandCardProps) {
  const listing = buildMarketplaceListing(brand, assets);

  return (
    <GlassCard hover padding="lg" className="text-black">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-black">My Brand</h3>
        <DashboardStatusBadge status={brand?.status ?? "draft"} />
      </div>

      <motion.div
        whileHover={{ scale: 1.01 }}
        transition={{ duration: 0.25 }}
        className="mt-5 overflow-hidden rounded-2xl border border-neutral-300 bg-white p-5"
      >
        <div className="flex flex-col gap-5 sm:flex-row">
          <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-300 bg-white">
            {listing.logoUrl ? (
              <Image
                src={listing.logoUrl}
                alt={listing.businessName}
                width={80}
                height={80}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-8 w-8 text-black" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4 className="text-xl font-bold text-black">{listing.businessName}</h4>
            <p className="mt-1 text-sm text-black">{listing.industry}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <MiniStat label="Investment" value={listing.investmentLabel} />
              <MiniStat label="Model" value={listing.modelLabel} />
              <MiniStat label="Cities" value={listing.locationLabel} />
              <MiniStat label="ROI" value={listing.roiLabel} />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/dashboard/brand-preview"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black bg-black px-4 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-[1.02]"
        >
          <Eye className="h-4 w-4" />
          Preview Listing
        </Link>
        <Link
          href="/dashboard/onboarding?step=1"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-black bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-neutral-100"
        >
          <Pencil className="h-4 w-4" />
          Edit Brand
        </Link>
        <button
          type="button"
          disabled
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-neutral-300 px-4 py-2.5 text-sm font-semibold text-black opacity-50"
          title="Available after approval"
        >
          <ExternalLink className="h-4 w-4" />
          View Public Page
        </button>
      </div>
    </GlassCard>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-black">{label}</p>
      <p className="mt-0.5 truncate font-medium text-black">{value}</p>
    </div>
  );
}
