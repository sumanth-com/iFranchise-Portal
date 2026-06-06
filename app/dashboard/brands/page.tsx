import Link from "next/link";
import { Plus, Store } from "lucide-react";

import { BrandPortfolioCard } from "@/components/dashboard/client/brand-portfolio-card";
import { getDashboardContext } from "@/lib/dashboard/context";

export default async function MyBrandsPage() {
  const { brands, assetsByBrandId, brandsError } = await getDashboardContext();

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            My Brands
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Manage all your franchise listings in one place.
          </p>
        </div>
        <Link
          href="/dashboard/brands/new"
          className="dash-cta-purple inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold !text-white shadow-[0_8px_24px_rgba(109,40,217,0.3)] transition-all hover:scale-[1.02] hover:bg-[#5B21B6] hover:shadow-[0_12px_32px_rgba(109,40,217,0.4)]"
        >
          <Plus className="h-4 w-4 !text-white" />
          Create Brand
        </Link>
      </div>

      {brandsError ? (
        <p
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {brandsError}
        </p>
      ) : null}

      {brands.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#6D28D9]/10 to-[#4F46E5]/5">
            <Store className="h-10 w-10 text-[#6D28D9]/60" />
          </div>
          <h2 className="mt-6 text-xl font-bold text-slate-900">No brands yet</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-slate-500">
            Create your first franchise listing and publish it to the marketplace.
          </p>
          <Link
            href="/dashboard/brands/new"
            className="dash-cta-purple mt-8 inline-flex items-center gap-2 rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold !text-white shadow-[0_8px_24px_rgba(109,40,217,0.3)] transition-transform hover:scale-[1.02]"
          >
            <Plus className="h-4 w-4 !text-white" />
            Create Brand
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand, index) => (
            <BrandPortfolioCard
              key={brand.id}
              brand={brand}
              index={index}
              assets={
                assetsByBrandId[brand.id] ?? {
                  logo: null,
                  gallery: [],
                  storePhotos: [],
                  productPhotos: [],
                  documents: [],
                }
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
