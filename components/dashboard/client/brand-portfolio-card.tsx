"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Lock,
  MapPin,
  Pencil,
  Store,
  Wallet,
} from "lucide-react";

import { BrandPortfolioStatusBadge } from "@/components/dashboard/client/brand-portfolio-status-badge";
import { canOwnerEditBrand } from "@/lib/brand/owner-access";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";
import { resolveBrandDisplayStatus } from "@/lib/dashboard/brand-display-status";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { brandEditPath } from "@/types/brand";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type BrandPortfolioCardProps = {
  brand: Brand;
  assets: BrandAssetsBundle;
  index?: number;
};

export function BrandPortfolioCard({
  brand,
  assets,
  index = 0,
}: BrandPortfolioCardProps) {
  const listing = buildMarketplaceListing(brand, assets);
  const previewHref = `/dashboard/brands/${brand.id}/preview`;
  const editHref = brandEditPath(brand.id);
  const displayStatus = resolveBrandDisplayStatus(brand);
  const canEdit = canOwnerEditBrand(brand);
  const bannerImage = listing.galleryUrls[0] ?? null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dateLabel = [
    brand.submitted_at ? `Submitted ${formatDate(brand.submitted_at)}` : null,
    brand.updated_at
      ? mounted
        ? `Updated ${formatRelativeTime(brand.updated_at)}`
        : `Updated ${formatDate(brand.updated_at)}`
      : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group mx-auto flex w-full max-w-[440px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(15,23,42,0.05)] transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(15,23,42,0.09)]"
    >
      {/* Cover — 3:2 ratio shows the full banner without heavy cropping */}
      <div className="relative aspect-[3/2] shrink-0 overflow-hidden bg-slate-50">
        {bannerImage ? (
          <Image
            src={bannerImage}
            alt=""
            fill
            unoptimized
            loading={index === 0 ? "eager" : "lazy"}
            sizes="440px"
            className="object-contain object-center transition-transform duration-500 ease-out group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#6D28D9]/10 via-slate-50 to-slate-100">
            <Building2 className="h-10 w-10 text-slate-300/80" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/20 to-transparent" />

        <div className="absolute right-2.5 top-2.5">
          <BrandPortfolioStatusBadge brand={brand} />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-3 px-4 py-3.5 sm:px-4 sm:py-4">
        {/* Logo + identity */}
        <div className="flex items-start gap-3">
          <div className="flex h-[52px] w-[52px] shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200/80 bg-white p-1.5 shadow-sm">
            {listing.logoUrl ? (
              <Image
                src={listing.logoUrl}
                alt=""
                width={52}
                height={52}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <Store className="h-5 w-5 text-slate-400" />
            )}
          </div>

          <div className="min-w-0 flex-1 pt-0.5">
            {listing.category ? (
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#6D28D9]">
                {listing.category}
              </p>
            ) : null}
            <h3 className="line-clamp-1 text-base font-bold tracking-tight text-slate-900">
              {listing.businessName}
            </h3>
            {listing.tagline ? (
              <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{listing.tagline}</p>
            ) : (
              <p className="mt-0.5 text-xs text-slate-400">No tagline yet</p>
            )}
          </div>
        </div>

        {/* Metrics — compact inline row */}
        <div className="flex items-center divide-x divide-slate-200 rounded-lg bg-slate-50/90 px-1 py-2 ring-1 ring-slate-100">
          <Metric label="Investment" value={listing.investmentLabel} icon={Wallet} />
          <Metric label="Model" value={listing.modelLabel} icon={Store} />
          <Metric label="Locations" value={listing.locationLabel} icon={MapPin} />
        </div>

        {dateLabel ? (
          <p className="text-[10px] text-slate-400">{dateLabel}</p>
        ) : null}

        {/* Actions */}
        <div className="flex gap-2 pt-0.5">
          <Link
            href={previewHref}
            className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#6D28D9] px-3 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#5B21B6]"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

          {canEdit ? (
            <Link
              href={editHref}
              className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-800 transition-colors hover:border-[#6D28D9]/30 hover:bg-slate-50"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Link>
          ) : displayStatus === "submitted" ? (
            <span className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200/80 bg-amber-50 px-2 text-xs font-semibold text-amber-900">
              <Lock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Review In Progress</span>
            </span>
          ) : null}
        </div>
      </div>
    </motion.article>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="min-w-0 flex-1 px-2 text-center">
      <div className="flex items-center justify-center gap-0.5 text-[8px] font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-2.5 w-2.5 shrink-0" />
        <span className="truncate">{label}</span>
      </div>
      <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-800">{value}</p>
    </div>
  );
}
