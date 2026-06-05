"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ClipboardList, Search, SlidersHorizontal } from "lucide-react";

import { BrandStatusBadge } from "@/components/brand/BrandStatusBadge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";
import type { AdminBrandListItem } from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

const STATUS_OPTIONS: { value: BrandStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "changes_requested", label: "Changes" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

type BrandTableProps = {
  brands: AdminBrandListItem[];
  statusFilter?: string;
  searchQuery?: string;
};

export function BrandTable({
  brands,
  statusFilter = "",
  searchQuery = "",
}: BrandTableProps) {
  return (
    <div id="queue" className="scroll-mt-24 space-y-6">
      <form
        method="get"
        action="/admin"
        className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-end"
      >
        <div className="relative flex-1 space-y-2">
          <label htmlFor="q" className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Search
          </label>
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] h-4 w-4 text-slate-400" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={searchQuery}
            placeholder="Business name..."
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:shadow-[var(--shadow-focus)]"
          />
        </div>
        <div className="space-y-2 sm:w-48">
          <label htmlFor="status" className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Status
          </label>
          <select
            id="status"
            name="status"
            defaultValue={statusFilter}
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface px-3 text-sm outline-none focus:border-primary-500"
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
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Apply
        </button>
        {(statusFilter || searchQuery) && (
          <Link
            href="/admin"
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border-strong px-5 text-sm font-medium hover:bg-surface-muted"
          >
            Clear
          </Link>
        )}
      </form>

      {brands.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No submissions found"
          description="Try adjusting your search or filters to find brands."
        />
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Business
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Created
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="transition-colors hover:bg-primary-50/40"
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {brand.business_name}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {brand.industry ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{brand.owner_email}</td>
                    <td className="px-4 py-3.5">
                      <BrandStatusBadge
                        status={brand.status}
                        pulse={brand.status === "submitted"}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(brand.created_at) ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/brands/${brand.id}`}
                        className="text-sm font-medium text-primary-600 hover:text-primary-700"
                      >
                        Review →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid gap-4 md:hidden"
          >
            {brands.map((brand) => (
              <motion.div key={brand.id} variants={staggerItem}>
                <Link
                  href={`/admin/brands/${brand.id}`}
                  className="block rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] transition-shadow hover:shadow-[var(--shadow-md)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {brand.business_name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {brand.owner_email}
                      </p>
                    </div>
                    <BrandStatusBadge status={brand.status} />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>{brand.industry ?? "—"}</span>
                    <span>{formatDate(brand.created_at)}</span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </>
      )}
    </div>
  );
}
