import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { ReviewActions } from "@/components/admin/ReviewActions";
import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { Card } from "@/components/ui/card";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrandById } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/format-date";

type BrandReviewPageProps = {
  params: Promise<{ id: string }>;
};

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border py-4 last:border-0 sm:flex-row sm:justify-between">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="text-sm text-foreground sm:max-w-[60%] sm:text-right whitespace-pre-wrap">
        {value?.trim() ? value : "—"}
      </dd>
    </div>
  );
}

export default async function BrandReviewPage({ params }: BrandReviewPageProps) {
  await requireAdmin();
  const { id } = await params;
  const { brand, error } = await getAdminBrandById(id);

  if (error) {
    return (
      <Card>
        <p className="text-sm text-red-800" role="alert">
          {error}
        </p>
        <Link
          href="/admin"
          className="mt-4 inline-flex text-sm font-medium text-primary-600"
        >
          Back to queue
        </Link>
      </Card>
    );
  }

  if (!brand) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to queue
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
            {brand.business_name}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {brand.owner_name ? `${brand.owner_name} · ` : ""}
            {brand.owner_email}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <BrandStatusBadge status={brand.status} pulse={brand.status === "submitted"} />
          {brand.publish_ready ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
              Publish ready
            </span>
          ) : null}
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <Card padding="lg">
            <h3 className="text-base font-semibold text-foreground">Brand dossier</h3>
            <dl className="mt-4">
              <DetailField label="Business name" value={brand.business_name} />
              <DetailField label="Tagline" value={brand.tagline} />
              <DetailField label="Industry" value={brand.industry} />
              <DetailField label="Category" value={brand.category} />
              <DetailField label="Description" value={brand.description} />
              <DetailField label="Website" value={brand.website_url} />
              <DetailField label="Contact email" value={brand.contact_email} />
              <DetailField label="Contact phone" value={brand.contact_phone} />
            </dl>
          </Card>

          <Card padding="lg">
            <h3 className="text-base font-semibold text-foreground">Investment & franchise</h3>
            <dl className="mt-4">
              <DetailField
                label="Investment range"
                value={
                  brand.investment_min != null
                    ? `₹${brand.investment_min}${brand.investment_max != null ? ` – ₹${brand.investment_max}` : ""}`
                    : null
                }
              />
              <DetailField
                label="Franchise fee"
                value={brand.franchise_fee != null ? `₹${brand.franchise_fee}` : null}
              />
              <DetailField
                label="Space required"
                value={
                  brand.space_required_sqft != null
                    ? `${brand.space_required_sqft} sq ft`
                    : null
                }
              />
              <DetailField
                label="ROI"
                value={brand.roi_percent != null ? `${brand.roi_percent}%` : null}
              />
              <DetailField
                label="Payback period"
                value={
                  brand.payback_period_months != null
                    ? `${brand.payback_period_months} months`
                    : null
                }
              />
              <DetailField
                label="Franchise models"
                value={brand.franchise_models?.join(", ")}
              />
              <DetailField
                label="Current outlets"
                value={brand.current_outlets?.toString()}
              />
              <DetailField
                label="Existing cities"
                value={brand.existing_cities?.join(", ")}
              />
            </dl>
          </Card>

          <Card padding="lg">
            <h3 className="text-base font-semibold text-foreground">Expansion & agreement</h3>
            <dl className="mt-4">
              <DetailField label="Target cities" value={brand.target_cities?.join(", ")} />
              <DetailField label="Tier 1" value={brand.expansion_tier_1?.join(", ")} />
              <DetailField label="Tier 2" value={brand.expansion_tier_2?.join(", ")} />
              <DetailField label="Metro" value={brand.expansion_metro?.join(", ")} />
              <DetailField
                label="Agreement term"
                value={
                  brand.agreement_term_years != null
                    ? `${brand.agreement_term_years} years`
                    : null
                }
              />
              <DetailField
                label="Lock-in period"
                value={
                  brand.lock_in_period_months != null
                    ? `${brand.lock_in_period_months} months`
                    : null
                }
              />
            </dl>
          </Card>

          <Card padding="lg">
            <h3 className="text-base font-semibold text-foreground">Timeline</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Created</span>
                <span>{formatDateTime(brand.created_at) ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Submitted</span>
                <span>{formatDateTime(brand.submitted_at) ?? "—"}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-500">Reviewed</span>
                <span>{formatDateTime(brand.reviewed_at) ?? "—"}</span>
              </div>
            </dl>
          </Card>

          {brand.admin_feedback ? (
            <Card padding="lg" className="border-amber-200 bg-amber-50/50">
              <h3 className="text-sm font-semibold text-amber-900">
                Previous feedback
              </h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-amber-900/90">
                {brand.admin_feedback}
              </p>
            </Card>
          ) : null}
        </div>

        <div className="xl:col-span-2">
          <ReviewActions brand={brand} />
        </div>
      </div>
    </div>
  );
}
