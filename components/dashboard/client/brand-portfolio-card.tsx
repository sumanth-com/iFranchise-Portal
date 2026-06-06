"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  MapPin,
  Store,
  Wallet,
} from "lucide-react";

import { buildMarketplaceListing, displayStatusLabel } from "@/lib/dashboard/listing-data";
import type { Brand, BrandStatus } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";
import { cn } from "@/lib/utils";

type BrandPortfolioCardProps = {
  brand: Brand;
  assets: BrandAssetsBundle;
  index?: number;
};

const STATUS_STYLES: Record<BrandStatus, string> = {
  draft: "bg-white/95 text-slate-700 shadow-sm",
  submitted: "bg-amber-50/95 text-amber-800 shadow-sm",
  changes_requested: "bg-orange-50/95 text-orange-800 shadow-sm",
  approved: "bg-emerald-50/95 text-emerald-800 shadow-sm",
  rejected: "bg-rose-50/95 text-rose-800 shadow-sm",
};

export function BrandPortfolioCard({
  brand,
  assets,
  index = 0,
}: BrandPortfolioCardProps) {
  const listing = buildMarketplaceListing(brand, assets);
  const previewHref = `/dashboard/brands/${brand.id}/preview`;
  const bannerImage = listing.galleryUrls[0] ?? null;
  const tags = buildTags(brand, listing.category, listing.industry);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="h-full"
    >
      <Link
        href={previewHref}
        className="group flex h-full max-w-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-1 hover:border-[#6D28D9]/20 hover:shadow-[0_16px_40px_rgba(109,40,217,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9] focus-visible:ring-offset-2"
      >
        {/* Banner */}
        <div className="relative aspect-[5/3] shrink-0 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
          {bannerImage ? (
            <Image
              src={bannerImage}
              alt=""
              fill
              unoptimized
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#6D28D9]/10 via-slate-50 to-slate-100">
              <Building2 className="h-14 w-14 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <span
            className={cn(
              "absolute right-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide backdrop-blur-sm",
              STATUS_STYLES[brand.status],
            )}
          >
            {displayStatusLabel(brand.status)}
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6D28D9]">
            {listing.category || listing.industry || "Franchise"}
          </p>
          <h3 className="mt-1 line-clamp-2 text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {listing.businessName}
          </h3>
          {listing.tagline ? (
            <p className="mt-1 line-clamp-1 text-sm text-slate-500">
              {listing.tagline}
            </p>
          ) : null}

          <div className="mt-3 grid grid-cols-3 gap-2 border-y border-slate-100 py-3 sm:mt-4 sm:gap-3 sm:py-4">
            <Stat label="Investment" value={listing.investmentLabel} icon={Wallet} />
            <Stat label="Model" value={listing.modelLabel} icon={Store} />
            <Stat label="Locations" value={listing.locationLabel} icon={MapPin} />
          </div>

          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <div className="mt-4 flex-1" />
          )}

          <span className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(109,40,217,0.3)] transition-all duration-300 group-hover:bg-[#5B21B6] group-hover:shadow-[0_6px_20px_rgba(109,40,217,0.4)]">
            View Details
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-1 truncate text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function buildTags(
  brand: Brand,
  category: string,
  industry: string,
): string[] {
  const tags = new Set<string>();
  if (category && category !== "Multi-location") tags.add(category);
  if (industry && industry !== "Franchise") tags.add(industry);
  brand.franchise_models.slice(0, 2).forEach((m) => tags.add(m.toUpperCase()));
  if (brand.roi_percent != null) tags.add(`${brand.roi_percent}% ROI`);
  return [...tags].slice(0, 4);
}
