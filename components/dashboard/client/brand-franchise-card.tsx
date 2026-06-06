"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Building2,
  Copy,
  Eye,
  MapPin,
  Pencil,
  Send,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useActionState } from "react";

import { DashboardStatusBadge } from "@/components/dashboard/client/dashboard-status-badge";
import {
  deleteBrandById,
  duplicateBrandById,
  submitBrandById,
} from "@/lib/brand/actions";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";
import { brandEditPath, initialBrandActionState, isBrandEditable, isBrandLocked } from "@/types/brand";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";
import { cn } from "@/lib/utils";

type BrandFranchiseCardProps = {
  brand: Brand;
  assets: BrandAssetsBundle;
};

export function BrandFranchiseCard({ brand, assets }: BrandFranchiseCardProps) {
  const listing = buildMarketplaceListing(brand, assets);
  const editable = isBrandEditable(brand.status);
  const locked = isBrandLocked(brand.status);

  const [submitState, submitAction, submitPending] = useActionState(
    submitBrandById,
    initialBrandActionState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteBrandById,
    initialBrandActionState,
  );
  const [dupState, dupAction, dupPending] = useActionState(
    duplicateBrandById,
    initialBrandActionState,
  );

  const actionError = submitState.error || deleteState.error || dupState.error;
  const actionMessage = submitState.message || deleteState.message || dupState.message;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="group overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_4px_20px_rgba(15,23,42,0.06)] transition-shadow hover:shadow-[0_12px_40px_rgba(15,23,42,0.1)]"
    >
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
        {listing.galleryUrls[0] ? (
          <Image
            src={listing.galleryUrls[0]}
            alt=""
            fill
            unoptimized
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Building2 className="h-12 w-12 text-slate-300" />
          </div>
        )}
        <div className="absolute right-3 top-3">
          <DashboardStatusBadge status={brand.status} />
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {listing.logoUrl ? (
              <Image
                src={listing.logoUrl}
                alt={listing.businessName}
                width={56}
                height={56}
                unoptimized
                className="h-full w-full object-cover"
              />
            ) : (
              <Building2 className="h-6 w-6 text-slate-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900">
              {listing.businessName}
            </h3>
            <p className="text-sm text-slate-500">
              {listing.industry}
              {listing.category ? ` · ${listing.category}` : ""}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metric icon={Wallet} label="Investment" value={listing.investmentLabel} />
          <Metric icon={TrendingUp} label="ROI" value={listing.roiLabel} />
          <Metric icon={Building2} label="Model" value={listing.modelLabel} />
          <Metric icon={MapPin} label="Locations" value={listing.locationLabel} />
        </div>

        {locked && brand.reviewed_at ? (
          <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
            Approved by iFranchise ·{" "}
            {new Date(brand.reviewed_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        ) : null}

        {actionError ? (
          <p className="mt-3 text-xs text-red-600" role="alert">
            {actionError}
          </p>
        ) : null}
        {actionMessage ? (
          <p className="mt-3 text-xs text-emerald-600">{actionMessage}</p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2">
          {editable ? (
            <ActionLink
              href={brandEditPath(brand.id)}
              icon={Pencil}
              label="Edit"
            />
          ) : null}
          <ActionLink
            href={`/dashboard/brands/${brand.id}/preview`}
            icon={Eye}
            label="Preview"
          />
          {editable && brand.status === "draft" ? (
            <form action={submitAction}>
              <input type="hidden" name="brandId" value={brand.id} />
              <ActionButton
                icon={Send}
                label={submitPending ? "Submitting…" : "Submit"}
                disabled={submitPending}
              />
            </form>
          ) : null}
          <form action={dupAction}>
            <input type="hidden" name="brandId" value={brand.id} />
            <ActionButton
              icon={Copy}
              label={dupPending ? "…" : "Duplicate"}
              disabled={dupPending}
              variant="secondary"
            />
          </form>
          {!locked ? (
            <form action={deleteAction}>
              <input type="hidden" name="brandId" value={brand.id} />
              <ActionButton
                icon={Trash2}
                label={deletePending ? "…" : "Delete"}
                disabled={deletePending}
                variant="danger"
              />
            </form>
          ) : null}
        </div>
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
    <div className="rounded-xl bg-slate-50 px-2.5 py-2">
      <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-slate-400">
        <Icon className="h-3 w-3" />
        {label}
      </div>
      <p className="mt-0.5 truncate text-xs font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function ActionLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Pencil;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#6D28D9] hover:text-[#6D28D9]"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </Link>
  );
}

function ActionButton({
  icon: Icon,
  label,
  disabled,
  variant = "primary",
}: {
  icon: typeof Pencil;
  label: string;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "danger";
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50",
        variant === "primary" &&
          "dash-cta-purple border border-[#6D28D9] bg-[#6D28D9] !text-white hover:bg-[#5B21B6]",
        variant === "secondary" &&
          "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        variant === "danger" &&
          "border border-red-200 bg-white text-red-600 hover:bg-red-50",
      )}
    >
      <Icon
        className={cn("h-3.5 w-3.5", variant === "primary" && "!text-white")}
      />
      {label}
    </button>
  );
}
