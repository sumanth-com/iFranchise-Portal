"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, Search, SlidersHorizontal } from "lucide-react";

import { AdminBrandCard } from "@/components/admin/brands/admin-brand-card";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer } from "@/lib/motion";
import type { AdminBrandListItem } from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

const STATUS_OPTIONS: { value: BrandStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Pending review" },
  { value: "changes_requested", label: "Changes requested" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

type BrandDirectoryProps = {
  brands: AdminBrandListItem[];
  statusFilter?: string;
  searchQuery?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  basePath?: string;
};

function buildPageUrl(
  basePath: string,
  params: { status?: string; q?: string; page?: number },
): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function BrandDirectory({
  brands,
  statusFilter = "",
  searchQuery = "",
  total = 0,
  page = 1,
  pageSize = 10,
  basePath = "/admin/brands",
}: BrandDirectoryProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = Boolean(statusFilter || searchQuery);

  return (
    <div className="space-y-6">
      <form
        method="get"
        action={basePath}
        className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
      >
        <div className="relative flex-1 space-y-2">
          <label
            htmlFor="brand-q"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] h-4 w-4 text-slate-400" />
          <input
            id="brand-q"
            name="q"
            type="search"
            defaultValue={searchQuery}
            placeholder="Brand name..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none transition-shadow focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
        <div className="space-y-2 sm:w-52">
          <label
            htmlFor="brand-status"
            className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Status
          </label>
          <select
            id="brand-status"
            name="status"
            defaultValue={statusFilter}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || "all"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white transition-colors hover:bg-violet-700"
        >
          Apply
        </button>
        {hasFilters ? (
          <Link
            href={basePath}
            className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {brands.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No brands found"
          description="Try adjusting your search or filters."
        />
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              <span className="font-semibold text-slate-800">{total}</span> brand
              {total === 1 ? "" : "s"} in directory
            </p>
            {hasFilters ? (
              <p className="text-xs">Filtered results</p>
            ) : null}
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {brands.map((brand, index) => (
              <AdminBrandCard key={brand.id} brand={brand} index={index} />
            ))}
          </motion.div>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="text-slate-500">
                Showing {(page - 1) * pageSize + 1}–
                {Math.min(page * pageSize, total)} of {total}
              </p>
              <div className="flex gap-2">
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(basePath, {
                      status: statusFilter,
                      q: searchQuery,
                      page: page - 1,
                    })}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50"
                  >
                    Previous
                  </Link>
                ) : null}
                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(basePath, {
                      status: statusFilter,
                      q: searchQuery,
                      page: page + 1,
                    })}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 font-medium hover:bg-slate-50"
                  >
                    Next
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
