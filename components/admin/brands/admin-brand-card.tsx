"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Clock,
  Globe,
  Mail,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AdminBrandStatusBadge } from "@/components/admin/admin-brand-status-badge";
import { formatDate, formatRelativeTime } from "@/lib/format-date";
import { staggerItem } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { AdminBrandListItem } from "@/types/admin";
import { isBrandPublished } from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

type AdminBrandCardProps = {
  brand: AdminBrandListItem;
  index: number;
};

const HERO_GRADIENT: Record<BrandStatus, string> = {
  submitted: "from-violet-700 via-purple-600 to-indigo-800",
  changes_requested: "from-indigo-700 via-violet-600 to-purple-800",
  approved: "from-purple-700 via-violet-600 to-fuchsia-800",
  rejected: "from-slate-700 via-rose-700 to-red-900",
  draft: "from-slate-600 via-violet-700 to-indigo-900",
};

const STAGE_HINT: Record<BrandStatus, string> = {
  submitted: "Awaiting your review",
  changes_requested: "Owner updating listing",
  approved: "Approved — ready for marketplace",
  rejected: "Declined listing",
  draft: "Owner still building profile",
};

function brandInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function ownerInitials(name: string | null, email: string): string {
  const source = name ?? email;
  const parts = source.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function listingAge(brand: AdminBrandListItem): string {
  const ref = brand.submitted_at ?? brand.created_at;
  const relative = formatRelativeTime(ref);
  if (!relative) return "Recently added";
  if (brand.submitted_at) return `Submitted ${relative}`;
  return `Created ${relative}`;
}

export function AdminBrandCard({ brand, index }: AdminBrandCardProps) {
  const published = isBrandPublished(brand);
  const industryLabel = brand.industry?.trim() || "General";
  const submittedLabel =
    formatDate(brand.submitted_at ?? brand.created_at) ?? "—";
  const heroGradient = HERO_GRADIENT[brand.status];

  return (
    <motion.article
      variants={staggerItem}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 340, damping: 24 }}
      className="group relative"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <Link
        href={`/admin/brands/${brand.id}`}
        className="relative flex h-full flex-col overflow-hidden rounded-[1.85rem] bg-white shadow-[0_12px_40px_rgba(88,28,135,0.08)] ring-1 ring-violet-100/80 transition-all duration-300 hover:shadow-[0_24px_60px_rgba(124,58,237,0.18)] hover:ring-violet-200"
      >
        {/* Identity header — logo + name side by side */}
        <div
          className={cn(
            "relative overflow-hidden bg-gradient-to-br px-5 pb-5 pt-4",
            heroGradient,
          )}
        >
          {brand.logo_url ? (
            <Image
              src={brand.logo_url}
              alt=""
              fill
              unoptimized
              aria-hidden
              className="object-cover opacity-20 blur-3xl scale-110"
              sizes="400px"
            />
          ) : null}

          <div
            className="pointer-events-none absolute inset-0 opacity-[0.1]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
              backgroundSize: "16px 16px",
            }}
            aria-hidden
          />

          <div className="relative">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-white backdrop-blur-md ring-1 ring-white/25">
                  Franchise
                </span>
                {published ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/90 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                    <Sparkles className="h-3 w-3" />
                    Live
                  </span>
                ) : null}
              </div>
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md ring-1 ring-white/20 transition-colors group-hover:bg-white group-hover:text-violet-600">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>

            {/* Logo beside brand name */}
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <div
                  className="absolute -inset-1.5 rounded-[1.2rem] bg-white/40 blur-md"
                  aria-hidden
                />
                <div className="relative flex h-[5.5rem] w-[5.5rem] items-center justify-center overflow-hidden rounded-[1.15rem] border-[3px] border-white bg-white p-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.2)] sm:h-24 sm:w-24 sm:p-3">
                  {brand.logo_url ? (
                    <Image
                      src={brand.logo_url}
                      alt={`${brand.business_name} logo`}
                      width={88}
                      height={88}
                      unoptimized
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-700 text-xl font-bold text-white">
                      {brandInitials(brand.business_name)}
                    </div>
                  )}
                </div>
                {published ? (
                  <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-violet-600 shadow-md">
                    <Globe className="h-3 w-3 text-white" />
                  </span>
                ) : null}
              </div>

              <div className="min-w-0 flex-1 text-left">
                <h3 className="line-clamp-2 text-xl font-bold leading-tight tracking-tight text-white drop-shadow-sm sm:text-2xl">
                  {brand.business_name}
                </h3>
                {brand.tagline ? (
                  <p className="mt-1 line-clamp-2 text-sm leading-snug text-violet-100/95">
                    {brand.tagline}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-violet-200/80">
                    Franchise opportunity
                  </p>
                )}
                <div className="mt-2.5">
                  <AdminBrandStatusBadge
                    brand={brand}
                    pulse={brand.status === "submitted"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-violet-50/80 px-3 py-2.5 text-left ring-1 ring-violet-100">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-violet-500">
                <MapPin className="h-3 w-3" />
                Industry
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold capitalize text-slate-800">
                {industryLabel}
              </p>
            </div>
            <div className="rounded-xl bg-purple-50/80 px-3 py-2.5 text-left ring-1 ring-purple-100">
              <p className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-purple-500">
                <Clock className="h-3 w-3" />
                Applied
              </p>
              <p className="mt-0.5 truncate text-sm font-semibold text-slate-800">
                {submittedLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-2xl border border-dashed border-violet-200/80 bg-gradient-to-r from-violet-50/50 to-purple-50/30 px-3 py-3 text-left">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-bold text-white shadow-sm">
              {ownerInitials(brand.owner_name, brand.owner_email)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {brand.owner_name ?? "Brand owner"}
              </p>
              <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                <Mail className="h-3 w-3 shrink-0 text-violet-400" />
                {brand.owner_email}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-center text-xs text-slate-400">
              {published ? "Published on marketplace" : STAGE_HINT[brand.status]}
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="text-slate-500">{listingAge(brand)}</span>
            </p>
            <span className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-200 transition-all group-hover:from-violet-700 group-hover:to-purple-700 group-hover:shadow-lg group-hover:shadow-violet-300/40">
              View brand profile
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
