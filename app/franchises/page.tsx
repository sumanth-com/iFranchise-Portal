import type { Metadata } from "next";
import Link from "next/link";

import { BrandCard } from "@/components/marketplace/brand-card";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { getMarketplaceBrands } from "@/lib/public/brands";

export const metadata: Metadata = {
  title: "Franchise Opportunities | iFranchise Marketplace",
  description:
    "Discover verified franchise brands across India. Search by industry, location, and investment range.",
};

type FranchisesPageProps = {
  searchParams: Promise<{
    q?: string;
    industry?: string;
    city?: string;
    investmentMin?: string;
    investmentMax?: string;
    page?: string;
  }>;
};

export default async function FranchisesPage({ searchParams }: FranchisesPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getMarketplaceBrands({
    q: params.q ?? null,
    industry: params.industry ?? null,
    city: params.city ?? null,
    investmentMin: params.investmentMin ? Number(params.investmentMin) : null,
    investmentMax: params.investmentMax ? Number(params.investmentMax) : null,
    page,
    pageSize: 12,
  });

  const data = result.data ?? {
    brands: [],
    total: 0,
    industries: [],
    cities: [],
    page: 1,
    pageSize: 12,
  };

  const totalPages = Math.max(1, Math.ceil(data.total / data.pageSize));

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
          Franchise Marketplace
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Explore verified franchise opportunities. Only published, admin-approved
          brands appear here.
        </p>
      </div>

      <MarketplaceFilters
        industries={data.industries}
        cities={data.cities}
        values={{
          q: params.q ?? "",
          industry: params.industry ?? "",
          city: params.city ?? "",
          investmentMin: params.investmentMin ?? "",
          investmentMax: params.investmentMax ?? "",
        }}
      />

      <p className="mt-8 text-sm text-slate-500">
        {data.total} {data.total === 1 ? "opportunity" : "opportunities"} found
      </p>

      {data.brands.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-lg font-medium text-slate-700">No brands match your filters</p>
          <p className="mt-2 text-sm text-slate-500">
            Try adjusting your search or check back when new brands are published.
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.brands.map((brand) => (
            <BrandCard key={brand.id} brand={brand} />
          ))}
        </div>
      )}

      {totalPages > 1 ? (
        <div className="mt-10 flex justify-center gap-3">
          {page > 1 ? (
            <Link
              href={`/franchises?${new URLSearchParams({ ...params, page: String(page - 1) } as Record<string, string>).toString()}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Previous
            </Link>
          ) : null}
          <span className="flex items-center px-4 text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link
              href={`/franchises?${new URLSearchParams({ ...params, page: String(page + 1) } as Record<string, string>).toString()}`}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-white"
            >
              Next
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
