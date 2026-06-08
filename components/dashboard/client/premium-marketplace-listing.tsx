"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Pencil,
  Search,
  Zap,
} from "lucide-react";

import { BrandPreviewActions } from "@/components/dashboard/client/brand-preview-actions";
import { isBrochureAsset } from "@/lib/assets/brochure-compat";
import type { MarketplaceListingData } from "@/lib/dashboard/listing-data";
import { FRANCHISE_MODEL_OPTIONS } from "@/types/brand";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";
import { cn } from "@/lib/utils";

type PremiumMarketplaceListingProps = {
  listing: MarketplaceListingData;
  brand: Brand;
  assets: BrandAssetsBundle;
};

const SUPPORT_ITEMS = [
  "Managed operations & performance reporting",
  "Central marketing and brand compliance",
  "Supply chain and vendor onboarding guidance",
  "Ongoing field support and operational reviews",
];

const GET_STARTED_STEPS = [
  {
    step: "01",
    badge: "~5 MIN",
    title: "Apply",
    description:
      "Share your profile, investment range, and preferred city. Takes under 5 minutes.",
    icon: Pencil,
  },
  {
    step: "02",
    badge: "7–14 DAYS",
    title: "Evaluation",
    description:
      "Our team reviews fit, territory potential, and readiness with a quick discovery call.",
    icon: Search,
  },
  {
    step: "03",
    badge: "2–4 WEEKS",
    title: "Approval",
    description:
      "Finalize terms, sign the franchise agreement, and secure your territory.",
    icon: CheckCircle2,
  },
  {
    step: "04",
    badge: "GO LIVE",
    title: "Launch",
    description:
      "Complete training, set up your unit, and open with full launch support.",
    icon: Zap,
  },
];

export function PremiumMarketplaceListing({
  listing,
  brand,
  assets,
}: PremiumMarketplaceListingProps) {
  const allImages = [
    ...listing.galleryUrls,
    ...assets.storePhotos.map((a) => a.previewUrl).filter(Boolean),
    ...assets.productPhotos.map((a) => a.previewUrl).filter(Boolean),
  ] as string[];

  const [carouselIndex, setCarouselIndex] = useState(0);
  const heroImage = allImages[carouselIndex] ?? allImages[0];
  const franchiseTypeLabel = formatFranchiseTypes(brand);
  const expansionLabel = formatExpansion(brand);
  const spaceLabel = formatSpace(brand);
  const paybackLabel = formatPaybackYears(brand.payback_period_months);
  const lockInLabel = formatLockIn(brand);
  const roiDisplay = brand.roi_percent != null ? `${brand.roi_percent}%` : listing.roiLabel.replace(/\s*ROI/i, "");
  const brochure = assets.documents.find(isBrochureAsset);
  const brochureUrl = brochure?.previewUrl;

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-sm">
            {listing.logoUrl ? (
              <Image
                src={listing.logoUrl}
                alt=""
                width={48}
                height={48}
                unoptimized
                className="h-full w-full object-contain"
              />
            ) : (
              <Building2 className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {listing.businessName}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            {brand.status === "approved" ? (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Verified
              </span>
            ) : null}
            <span className="rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#6D28D9] ring-1 ring-[#DDD6FE]">
              Growing
            </span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2.5">
          {brochureUrl ? (
            <a
              href={brochureUrl}
              download={brochure?.file_name ?? "franchise-brochure.pdf"}
              target="_blank"
              rel="noopener noreferrer"
              className="dash-cta-purple inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-[#5B21B6]"
            >
              <Download className="h-4 w-4" />
              Download brochure
            </a>
          ) : (
            <button
              type="button"
              disabled
              title="Upload a brochure in Brand Assets to enable download"
              className="dash-cta-purple inline-flex cursor-not-allowed items-center gap-2 rounded-xl bg-[#6D28D9]/45 px-5 py-2.5 text-sm font-semibold !text-white/80"
            >
              <Download className="h-4 w-4" />
              Download brochure
            </button>
          )}
          <button
            type="button"
            className="dash-cta-purple rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold !text-white shadow-sm transition-colors hover:bg-[#5B21B6]"
          >
            Enquire now
          </button>
        </div>
      </header>

      {/* Franchise opportunity + gallery */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900 sm:text-xl">
              {listing.businessName} Franchise Opportunity
            </h2>
            <p className="mt-3 text-sm font-semibold text-[#6D28D9]">Highlights</p>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              <MetricCard label="Investment" value={listing.investmentLabel} />
              <MetricCard label="Space (sq.ft)" value={spaceLabel} />
              <MetricCard label="ROI" value={roiDisplay} />
              <MetricCard label="Payback" value={paybackLabel} />
              <MetricCard label="Outlets" value={listing.outletsLabel} />
              <MetricCard label="Lock-in" value={lockInLabel} />
            </div>

            <div className="mt-5 space-y-1 text-sm text-slate-700">
              <p>
                <span className="font-semibold text-slate-900">Agreement term:</span>{" "}
                {brand.agreement_term_years
                  ? `${brand.agreement_term_years} Years`
                  : "On request"}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Model:</span>{" "}
                {listing.modelLabel}
              </p>
              <p>
                <span className="font-semibold text-slate-900">Expansion:</span>{" "}
                {expansionLabel}
              </p>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-100">
            <div className="relative aspect-[4/3] w-full">
              {heroImage ? (
                <Image
                  src={heroImage}
                  alt=""
                  fill
                  unoptimized
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 560px"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
                  <Building2 className="h-16 w-16 text-slate-300" />
                </div>
              )}

              {allImages.length > 0 ? (
                <span className="absolute right-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                  {carouselIndex + 1} / {allImages.length}
                </span>
              ) : null}

              {allImages.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex(
                        (i) => (i - 1 + allImages.length) % allImages.length,
                      )
                    }
                    className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md hover:bg-white"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCarouselIndex((i) => (i + 1) % allImages.length)
                    }
                    className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-md hover:bg-white"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCarouselIndex(i)}
                        className={cn(
                          "h-2 w-2 rounded-full transition-colors",
                          i === carouselIndex ? "bg-white" : "bg-white/45",
                        )}
                        aria-label={`Go to image ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* About + Investment */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard title={`About ${listing.businessName}`}>
          {listing.tagline ? (
            <p className="text-base font-semibold text-slate-900">{listing.tagline}</p>
          ) : null}
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {brand.description?.trim() || listing.description}
          </p>

          <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            What this means for you
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
            <li>
              <span className="font-semibold text-slate-900">
                Established Brand Proposition:
              </span>{" "}
              {listing.outletsLabel} with presence across{" "}
              {listing.locationLabel.toLowerCase()}.
            </li>
            <li>
              <span className="font-semibold text-slate-900">Returns Profile:</span>{" "}
              Indicative returns around {roiDisplay}
              {brand.payback_period_months
                ? ` with payback in ${paybackLabel}`
                : ""}
              .
            </li>
          </ul>
        </ContentCard>

        <ContentCard title="Investment & Financials">
          <p className="text-xs leading-relaxed text-slate-500">
            Indicative figures from brand disclosure. Final numbers depend on city,
            format, and site.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <MetricCard
              label="Franchise Fee"
              value={formatLakhs(brand.franchise_fee)}
              compact
            />
            <MetricCard label="Space (sq.ft)" value={spaceLabel} compact />
            <MetricCard label="Returns" value={roiDisplay} compact />
            <MetricCard label="Payback" value={paybackLabel} compact />
            <MetricCard
              label="Franchise Types"
              value={franchiseTypeLabel}
              compact
              className="col-span-2 sm:col-span-1"
            />
          </div>
        </ContentCard>
      </div>

      {/* Support + Get Started */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ContentCard title="Brand & Partner Support">
          <ul className="space-y-2.5">
            {SUPPORT_ITEMS.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
              >
                <span className="dash-on-color mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6D28D9]">
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </ContentCard>

        <ContentCard title="How to Get Started">
          <p className="text-sm text-slate-500">
            Four clear steps from first click to launch. No guesswork between
            milestones.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {GET_STARTED_STEPS.map((step) => (
              <div
                key={step.step}
                className="rounded-xl border border-slate-200 bg-white p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="dash-on-color flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#6D28D9]">
                    <step.icon className="h-4 w-4" strokeWidth={2} />
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {step.badge}
                  </span>
                </div>
                <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Step {step.step}
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{step.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>

      <BrandPreviewActions brand={brand} />
    </div>
  );
}

function ContentCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  compact = false,
  className,
}: {
  label: string;
  value: string;
  compact?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white",
        compact ? "px-3 py-3" : "px-3 py-3.5",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-bold text-slate-900",
          compact ? "text-sm" : "text-base",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function formatLakhs(value: number | null): string {
  if (value == null) return "On request";
  const lakhs = value / 100000;
  if (lakhs >= 1) {
    const rounded = lakhs % 1 === 0 ? lakhs.toFixed(0) : lakhs.toFixed(1);
    return `₹${rounded} Lakhs`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatSpace(brand: Brand): string {
  if (brand.space_required_sqft) {
    return brand.space_required_sqft.toLocaleString("en-IN");
  }
  return "As per brand format";
}

function formatPaybackYears(months: number | null): string {
  if (months == null) return "On request";
  if (months % 12 === 0) {
    const years = months / 12;
    return years === 1 ? "1 year" : `${years} years`;
  }
  return `${months} months`;
}

function formatLockIn(brand: Brand): string {
  if (brand.lock_in_period_months != null) {
    if (brand.lock_in_period_months % 12 === 0) {
      const years = brand.lock_in_period_months / 12;
      return years === 1 ? "1 Year" : `${years} Years`;
    }
    return `${brand.lock_in_period_months} months`;
  }
  if (brand.agreement_term_years) {
    return `${brand.agreement_term_years} Years`;
  }
  return "On request";
}

function formatFranchiseTypes(brand: Brand): string {
  if (!brand.franchise_models.length) return "Unit Franchise";
  return brand.franchise_models
    .map((m) => FRANCHISE_MODEL_OPTIONS.find((o) => o.value === m)?.label ?? m)
    .join(" · ");
}

function formatExpansion(brand: Brand): string {
  const parts = [
    ...brand.expansion_tier_1,
    ...brand.expansion_metro,
    ...brand.target_cities,
  ].filter(Boolean);
  if (parts.length > 0) {
    return parts.slice(0, 3).join(", ");
  }
  if (brand.expansion_tier_2.length > 0) {
    return brand.expansion_tier_2.slice(0, 3).join(", ");
  }
  return listingFallbackExpansion(brand);
}

function listingFallbackExpansion(brand: Brand): string {
  const cities = [...brand.existing_cities, ...brand.target_cities];
  if (cities.length > 0) return cities.slice(0, 3).join(", ");
  return "Pan-India expansion";
}
