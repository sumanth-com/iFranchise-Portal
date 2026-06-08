import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { getDashboardContext } from "@/lib/dashboard/context";

export default async function MarketplacePreviewPage() {
  const { brands, brandsError } = await getDashboardContext();

  if (!brandsError && brands.length === 1) {
    redirect(`/dashboard/brands/${brands[0].id}/preview`);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          Live Listing
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          See how investors view your franchise listing on iFranchise.
        </p>
      </div>

      {brandsError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {brandsError}
        </div>
      ) : null}

      {!brandsError && brands.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-slate-600">Create a brand first to preview your listing.</p>
          <Link
            href="/dashboard/brands/new"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#6D28D9]"
          >
            Create Brand
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : !brandsError ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {brands.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/dashboard/brands/${brand.id}/preview`}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div>
                  <p className="font-semibold text-slate-900">{brand.business_name}</p>
                  <p className="text-sm capitalize text-slate-500">{brand.status.replace("_", " ")}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-[#6D28D9]" />
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
