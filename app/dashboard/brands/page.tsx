import Link from "next/link";
import { Plus } from "lucide-react";

import { BrandPortfolioView } from "@/components/dashboard/client/brand-portfolio-view";
import { BrandsEmptyState } from "@/components/dashboard/client/brands-empty-state";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import { getDashboardContext } from "@/lib/dashboard/context";

export const dynamic = "force-dynamic";

export default async function MyBrandsPage() {
  const { profile, brands, assetsByBrandId, brandsError } =
    await getDashboardContext();

  return (
    <div className="portal-page w-full space-y-6">
      <PortalPageHeader
        eyebrow="Portfolio"
        title="My Brands"
        description={
          brands.length > 0
            ? `${brands.length} listing${brands.length === 1 ? "" : "s"} · synced from your account`
            : "Manage all your franchise listings in one place."
        }
        action={
          <Link
            href="/dashboard/brands/new"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_4px_16px_rgba(109,40,217,0.28)] transition-all duration-200 hover:bg-[#5B21B6] sm:w-auto"
          >
            <Plus className="h-4 w-4" />
            Create Brand
          </Link>
        }
      />

      {brandsError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {brandsError}
        </p>
      ) : null}

      {brands.length === 0 ? (
        <BrandsEmptyState />
      ) : (
        <BrandPortfolioView
          userId={profile.id}
          brands={brands}
          assetsByBrandId={assetsByBrandId}
        />
      )}
    </div>
  );
}
