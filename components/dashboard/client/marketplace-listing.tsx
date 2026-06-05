"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Building2, MapPin, TrendingUp, Wallet } from "lucide-react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import type { MarketplaceListingData } from "@/lib/dashboard/listing-data";
import { cn } from "@/lib/utils";

type MarketplaceListingProps = {
  listing: MarketplaceListingData;
  variant?: "card" | "full" | "mini";
  className?: string;
};

export function MarketplaceListing({
  listing,
  variant = "card",
  className,
}: MarketplaceListingProps) {
  const isMini = variant === "mini";
  const isFull = variant === "full";

  return (
    <motion.article
      layout
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-neutral-300 bg-white text-black shadow-[0_4px_20px_rgba(0,0,0,0.08)]",
        isMini && "rounded-xl",
        isFull && "rounded-3xl",
        className,
      )}
    >
      {!isMini && listing.galleryUrls[0] ? (
        <div className="relative h-40 w-full overflow-hidden border-b border-neutral-200 sm:h-48">
          <Image
            src={listing.galleryUrls[0]}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : null}

      <div className={cn("relative", isMini ? "p-4" : "p-5 sm:p-6")}>
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-neutral-300 bg-white",
              isMini ? "h-12 w-12" : "h-16 w-16",
            )}
          >
            {listing.logoUrl ? (
              <Image
                src={listing.logoUrl}
                alt={listing.businessName}
                width={64}
                height={64}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2
                className={cn("text-black", isMini ? "h-5 w-5" : "h-7 w-7")}
              />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={cn(
                  "font-bold tracking-tight text-black",
                  isMini ? "text-base" : "text-xl sm:text-2xl",
                )}
              >
                {listing.businessName}
              </h3>
              <DashboardStatusBadge status={listing.status} />
            </div>
            <p className="mt-1 text-sm text-black">{listing.tagline}</p>
            <p className="mt-1 text-xs text-black">
              {listing.industry} · {listing.category}
            </p>
          </div>
        </div>

        {!isMini ? (
          <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-black">
            {listing.description}
          </p>
        ) : null}

        <div
          className={cn(
            "mt-4 grid gap-3",
            isMini ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4",
          )}
        >
          <Metric icon={Wallet} label="Investment" value={listing.investmentLabel} />
          <Metric icon={TrendingUp} label="ROI" value={listing.roiLabel} />
          <Metric icon={Building2} label="Model" value={listing.modelLabel} />
          <Metric icon={MapPin} label="Locations" value={listing.locationLabel} />
        </div>

        {isFull && listing.galleryUrls.length > 1 ? (
          <div className="mt-5 grid grid-cols-3 gap-2">
            {listing.galleryUrls.slice(1, 4).map((url) => (
              <div
                key={url}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-200"
              >
                <Image src={url} alt="" fill unoptimized className="object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </motion.article>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-300 bg-white px-3 py-2.5">
      <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-black">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-semibold text-black">{value}</p>
    </div>
  );
}
