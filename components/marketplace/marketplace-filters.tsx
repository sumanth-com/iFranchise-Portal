"use client";

import { Search, SlidersHorizontal } from "lucide-react";

type MarketplaceFiltersProps = {
  industries: string[];
  cities: string[];
  values: {
    q: string;
    industry: string;
    city: string;
    investmentMin: string;
    investmentMax: string;
  };
};

export function MarketplaceFilters({
  industries,
  cities,
  values,
}: MarketplaceFiltersProps) {
  return (
    <form
      method="get"
      action="/franchises"
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <SlidersHorizontal className="h-4 w-4 text-primary-600" />
        Filter opportunities
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="relative lg:col-span-2">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            name="q"
            type="search"
            defaultValue={values.q}
            placeholder="Search brands..."
            className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
        <select
          name="industry"
          defaultValue={values.industry}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All industries</option>
          {industries.map((ind) => (
            <option key={ind} value={ind}>
              {ind}
            </option>
          ))}
        </select>
        <select
          name="city"
          defaultValue={values.city}
          className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary-500"
        >
          <option value="">All locations</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
        <div className="flex gap-2">
          <input
            name="investmentMin"
            type="number"
            defaultValue={values.investmentMin}
            placeholder="Min ₹"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary-500"
          />
          <input
            name="investmentMax"
            type="number"
            defaultValue={values.investmentMax}
            placeholder="Max ₹"
            className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-primary-500"
          />
        </div>
      </div>
      <div className="mt-4 flex gap-3">
        <button
          type="submit"
          className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Apply filters
        </button>
        {(values.q ||
          values.industry ||
          values.city ||
          values.investmentMin ||
          values.investmentMax) && (
          <a
            href="/franchises"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Clear
          </a>
        )}
      </div>
    </form>
  );
}
