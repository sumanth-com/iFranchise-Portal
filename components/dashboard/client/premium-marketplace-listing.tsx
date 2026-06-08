"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import {
  Building2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  MapPin,
  TrendingUp,
  Wallet,
  Clock,
  Users,
  Maximize2,
} from "lucide-react";

import { BrandPreviewActions } from "@/components/dashboard/client/brand-preview-actions";
import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
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

  const cities = [...new Set([...brand.target_cities, ...brand.existing_cities])];

  return (
    <div className="space-y-8 pb-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_48px_rgba(15,23,42,0.08)]">
        <div className="relative h-56 sm:h-72 lg:h-96">
          {heroImage ? (
            <Image
              src={heroImage}
              alt=""
              fill
              unoptimized
              className="object-cover"
              priority
              fetchPriority="high"
              sizes="(max-width: 1024px) 100vw, 1200px"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#6D28D9]/20 to-slate-100">
              <Building2 className="h-20 w-20 text-slate-300" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
          {allImages.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() =>
                  setCarouselIndex((i) => (i - 1 + allImages.length) % allImages.length)
                }
                className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white"
                aria-label="Previous image"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setCarouselIndex((i) => (i + 1) % allImages.length)}
                className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-800 shadow-lg hover:bg-white"
                aria-label="Next image"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-2xl sm:h-28 sm:w-28">
                {listing.logoUrl ? (
                  <Image src={listing.logoUrl} alt="" width={112} height={112} unoptimized className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-12 w-12 text-slate-400" />
                )}
              </div>
              <div className="min-w-0 flex-1 text-white">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <DashboardStatusBadge status={brand.status} />
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium backdrop-blur">
                    {listing.industry}
                  </span>
                </div>
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {listing.businessName}
                </h1>
                <p className="mt-2 text-base text-white/90 sm:text-lg">{listing.tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick stats bar */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-t border-slate-100 sm:grid-cols-5">
          <QuickStat icon={Wallet} label="Investment" value={listing.investmentLabel} />
          <QuickStat icon={TrendingUp} label="ROI" value={listing.roiLabel} />
          <QuickStat icon={Clock} label="Payback" value={formatPayback(brand.payback_period_months)} />
          <QuickStat icon={MapPin} label="Locations" value={listing.locationLabel} />
          <QuickStat icon={Building2} label="Model" value={listing.modelLabel} className="col-span-2 sm:col-span-1" />
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <Section title="About Brand" icon={Building2}>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Brand Story</h4>
                <p className="mt-2 text-base leading-relaxed text-slate-600">
                  {brand.description?.trim() || "Brand story coming soon."}
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <HighlightCard title="Why Invest" text={brand.tagline ?? "Strong unit economics and proven scalability."} />
                <HighlightCard title="USP" text={`${listing.category} · ${listing.outletsLabel}`} />
              </div>
            </div>
          </Section>

          <Section title="Investment Details" icon={Wallet}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailTile label="Investment Range" value={listing.investmentLabel} />
              <DetailTile label="Franchise Fee" value={formatCurrency(brand.franchise_fee)} />
              <DetailTile label="Working Capital" value="On request" />
              <DetailTile label="ROI" value={listing.roiLabel} />
              <DetailTile label="Payback Period" value={formatPayback(brand.payback_period_months)} />
              <DetailTile label="Space Required" value={brand.space_required_sqft ? `${brand.space_required_sqft.toLocaleString()} sq ft` : "On request"} />
            </div>
          </Section>

          <Section title="Franchise Model" icon={Users}>
            <div className="flex flex-wrap gap-2">
              {(brand.franchise_models.length ? brand.franchise_models : ["FOFO"]).map((m) => {
                const opt = FRANCHISE_MODEL_OPTIONS.find((o) => o.value === m);
                return (
                  <span key={m} className="rounded-xl bg-[#F5F3FF] px-4 py-2 text-sm font-semibold text-[#6D28D9]">
                    {opt?.label ?? m}
                  </span>
                );
              })}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <DetailTile label="Area Requirements" value={brand.space_required_sqft ? `${brand.space_required_sqft} sq ft` : "Flexible"} />
              <DetailTile label="Agreement Term" value={brand.agreement_term_years ? `${brand.agreement_term_years} years` : "—"} />
              <DetailTile label="Operational Support" value="Training, marketing & supply chain" />
            </div>
          </Section>

          <Section title="Locations" icon={MapPin}>
            <p className="mb-4 text-sm text-slate-600">{listing.locationLabel}</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(cities.length ? cities : ["Pan-India"]).map((city) => (
                <motion.div
                  key={city}
                  whileHover={{ y: -2 }}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-800"
                >
                  <MapPin className="mb-1 h-4 w-4 text-[#6D28D9]" />
                  {city}
                </motion.div>
              ))}
            </div>
            {brand.expansion_tier_1.length > 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                Tier 1 expansion: {brand.expansion_tier_1.join(", ")}
              </p>
            ) : null}
          </Section>

          {allImages.length > 0 ? (
            <Section title="Gallery" icon={Maximize2}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allImages.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setCarouselIndex(i)}
                    className={cn(
                      "relative aspect-[4/3] overflow-hidden rounded-xl ring-2 ring-offset-2 transition-all",
                      carouselIndex === i ? "ring-[#6D28D9]" : "ring-transparent hover:ring-slate-200",
                    )}
                  >
                    <Image
                      src={url}
                      alt=""
                      fill
                      unoptimized
                      loading="lazy"
                      sizes="(max-width: 640px) 50vw, 200px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </Section>
          ) : null}

          {assets.documents.length > 0 ? (
            <Section title="Downloads" icon={Download}>
              <ul className="space-y-2">
                {assets.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.previewUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    >
                      <FileText className="h-5 w-5 shrink-0" />
                      {doc.file_name}
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}

          <Section title="FAQ" icon={ChevronDown}>
            <FaqAccordion items={buildFaq(listing, brand)} />
          </Section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <BrandPreviewActions brand={brand} />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Wallet;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8"
    >
      <div className="mb-5 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F5F3FF] text-[#6D28D9]">
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="text-xl font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function QuickStat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={cn("px-4 py-4 sm:px-5 sm:py-5", className)}>
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="mt-1 truncate text-sm font-bold text-slate-900 sm:text-base">{value}</p>
    </div>
  );
}

function DetailTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function HighlightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-xl border border-[#DDD6FE] bg-[#F5F3FF]/50 p-4">
      <p className="text-sm font-semibold text-[#6D28D9]">{title}</p>
      <p className="mt-1 text-sm text-slate-700">{text}</p>
    </div>
  );
}

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="divide-y divide-slate-100 rounded-xl border border-slate-100">
      {items.map((item, i) => (
        <div key={item.q}>
          <button
            type="button"
            onClick={() => setOpen(open === i ? null : i)}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left text-sm font-semibold text-slate-900 hover:bg-slate-50"
          >
            {item.q}
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open === i && "rotate-180")} />
          </button>
          <AnimatePresence>
            {open === i ? (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <p className="px-4 pb-4 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

function buildFaq(listing: MarketplaceListingData, brand: Brand) {
  return [
    { q: "What is the minimum investment?", a: listing.investmentLabel },
    { q: "What franchise models are available?", a: listing.modelLabel },
    { q: "What is the expected ROI?", a: listing.roiLabel },
    { q: "Where is the brand expanding?", a: listing.locationLabel },
    {
      q: "What support does the franchisor provide?",
      a: "Training, marketing support, supply chain assistance, and ongoing operational guidance.",
    },
    {
      q: "How many outlets exist today?",
      a: brand.current_outlets != null ? `${brand.current_outlets}+ outlets` : listing.outletsLabel,
    },
  ];
}

function formatCurrency(value: number | null): string {
  if (value == null) return "On request";
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatPayback(months: number | null): string {
  if (months == null) return "On request";
  return `${months} months`;
}
