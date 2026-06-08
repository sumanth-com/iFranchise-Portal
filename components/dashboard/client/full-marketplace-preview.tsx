"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Building2,
  Download,
  FileText,
  HelpCircle,
  MapPin,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import type { MarketplaceListingData } from "@/lib/dashboard/listing-data";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type FullMarketplacePreviewProps = {
  listing: MarketplaceListingData;
  brand: Brand | null;
  assets: BrandAssetsBundle;
};

export function FullMarketplacePreview({
  listing,
  brand,
  assets,
}: FullMarketplacePreviewProps) {
  const allImages = [
    ...listing.galleryUrls,
    ...assets.storePhotos.map((a) => a.previewUrl).filter(Boolean),
    ...assets.productPhotos.map((a) => a.previewUrl).filter(Boolean),
  ] as string[];

  return (
    <div className="space-y-0 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_8px_40px_rgba(15,23,42,0.08)]">
      {/* Hero Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80">
        {allImages[0] ? (
          <Image
            src={allImages[0]}
            alt=""
            fill
            unoptimized
            className="object-cover"
            priority
            fetchPriority="high"
            sizes="(max-width: 1024px) 100vw, 1200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <Building2 className="h-16 w-16 text-slate-300" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <div className="flex items-end gap-4">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white bg-white shadow-xl sm:h-24 sm:w-24">
              {listing.logoUrl ? (
                <Image
                  src={listing.logoUrl}
                  alt={listing.businessName}
                  width={96}
                  height={96}
                  unoptimized
                  className="h-full w-full object-cover"
                />
              ) : (
                <Building2 className="h-10 w-10 text-slate-400" />
              )}
            </div>
            <div className="min-w-0 flex-1 text-white">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <DashboardStatusBadge status={listing.status} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
                {listing.businessName}
              </h1>
              <p className="mt-1 text-sm text-white/90 sm:text-base">
                {listing.tagline}
              </p>
              <p className="mt-1 text-xs text-white/70 sm:text-sm">
                {listing.industry} · {listing.category}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 p-6 sm:p-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          {/* Investment Details */}
          <Section title="Investment Details" icon={Wallet}>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailCard label="Investment Range" value={listing.investmentLabel} />
              <DetailCard label="ROI" value={listing.roiLabel} />
              <DetailCard label="Franchise Fee" value={formatFee(brand?.franchise_fee)} />
              <DetailCard
                label="Payback Period"
                value={
                  brand?.payback_period_months
                    ? `${brand.payback_period_months} months`
                    : "On request"
                }
              />
            </div>
          </Section>

          {/* Business Model */}
          <Section title="Business Model" icon={Building2}>
            <p className="text-sm leading-relaxed text-slate-600">
              {listing.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {brand?.franchise_models.map((m) => (
                <span
                  key={m}
                  className="rounded-full bg-[#F5F3FF] px-3 py-1 text-xs font-semibold text-[#6D28D9]"
                >
                  {m}
                </span>
              )) ?? (
                <span className="text-sm text-slate-500">{listing.modelLabel}</span>
              )}
            </div>
          </Section>

          {/* Gallery */}
          {allImages.length > 0 ? (
            <Section title="Gallery" icon={Building2}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allImages.slice(0, 6).map((url) => (
                  <div
                    key={url}
                    className="relative aspect-[4/3] overflow-hidden rounded-xl"
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
                  </div>
                ))}
              </div>
            </Section>
          ) : null}

          {/* Expansion Plan */}
          <Section title="Expansion Plan" icon={MapPin}>
            <div className="space-y-3 text-sm text-slate-600">
              {brand?.target_cities.length ? (
                <p>
                  <strong className="text-slate-900">Target cities:</strong>{" "}
                  {brand.target_cities.join(", ")}
                </p>
              ) : null}
              {brand?.existing_cities.length ? (
                <p>
                  <strong className="text-slate-900">Existing locations:</strong>{" "}
                  {brand.existing_cities.join(", ")}
                </p>
              ) : null}
              <p>{listing.locationLabel}</p>
              {brand?.current_outlets != null ? (
                <p>
                  <strong className="text-slate-900">Current outlets:</strong>{" "}
                  {brand.current_outlets}
                </p>
              ) : null}
            </div>
          </Section>

          {/* FAQ */}
          <Section title="FAQ" icon={HelpCircle}>
            <div className="space-y-4">
              <FaqItem
                q="What is the minimum investment?"
                a={listing.investmentLabel}
              />
              <FaqItem
                q="What franchise models are available?"
                a={listing.modelLabel}
              />
              <FaqItem q="What is the expected ROI?" a={listing.roiLabel} />
            </div>
          </Section>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
          >
            <h3 className="text-sm font-bold text-slate-900">Key Metrics</h3>
            <ul className="mt-4 space-y-3">
              <MetricRow icon={Wallet} label="Investment" value={listing.investmentLabel} />
              <MetricRow icon={TrendingUp} label="ROI" value={listing.roiLabel} />
              <MetricRow icon={Building2} label="Model" value={listing.modelLabel} />
              <MetricRow icon={MapPin} label="Locations" value={listing.locationLabel} />
            </ul>
          </motion.div>

          {/* Downloads */}
          {assets.documents.length > 0 ? (
            <Section title="Downloads" icon={Download} compact>
              <ul className="space-y-2">
                {assets.documents.map((doc) => (
                  <li key={doc.id}>
                    <a
                      href={doc.previewUrl ?? "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 hover:border-[#6D28D9] hover:text-[#6D28D9]"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{doc.file_name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  compact,
}: {
  title: string;
  icon: typeof Wallet;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : "border-b border-slate-100 pb-8 last:border-0"}>
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-5 w-5 text-[#6D28D9]" />
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function MetricRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
}) {
  return (
    <li className="flex items-center justify-between gap-2 text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />
        {label}
      </span>
      <span className="font-semibold text-slate-900">{value}</span>
    </li>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm font-semibold text-slate-900">{q}</p>
      <p className="mt-1 text-sm text-slate-600">{a}</p>
    </div>
  );
}

function formatFee(fee: number | null | undefined): string {
  if (fee == null) return "On request";
  return `₹${fee.toLocaleString("en-IN")}`;
}
