"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  CheckCircle2,
  ClipboardList,
  Eye,
  MessageSquareWarning,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";

import { AdminBrandStatusBadge } from "@/components/admin/admin-brand-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/format-date";
import { staggerContainer, staggerItem } from "@/lib/motion";
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

type BrandTableProps = {
  brands: AdminBrandListItem[];
  statusFilter?: string;
  searchQuery?: string;
  total?: number;
  page?: number;
  pageSize?: number;
  basePath?: string;
  title?: string;
  description?: string;
  showQuickActions?: boolean;
  pendingOnly?: boolean;
};

function buildPageUrl(
  basePath: string,
  params: { status?: string; q?: string; page?: number; pending?: boolean },
): string {
  const search = new URLSearchParams();
  if (params.status) search.set("status", params.status);
  if (params.q) search.set("q", params.q);
  if (params.page && params.page > 1) search.set("page", String(params.page));
  if (params.pending) search.set("pending", "1");
  const qs = search.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

export function BrandTable({
  brands,
  statusFilter = "",
  searchQuery = "",
  total = 0,
  page = 1,
  pageSize = 10,
  basePath = "/admin/brands",
  title = "Brand directory",
  description = "Search, filter, and manage all franchise brand submissions.",
  showQuickActions = true,
  pendingOnly = false,
}: BrandTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const hasFilters = Boolean(statusFilter || searchQuery || pendingOnly);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <form
        method="get"
        action={basePath}
        className="flex flex-col gap-3 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:flex-row sm:items-end"
      >
        {pendingOnly ? (
          <input type="hidden" name="pending" value="1" />
        ) : null}
        <div className="relative flex-1 space-y-2">
          <label
            htmlFor="q"
            className="text-xs font-semibold uppercase tracking-wider text-slate-500"
          >
            Search
          </label>
          <Search className="pointer-events-none absolute left-3 top-[2.125rem] h-4 w-4 text-slate-400" />
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={searchQuery}
            placeholder="Brand name..."
            className="h-11 w-full rounded-[var(--radius-md)] border border-border-strong bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary-500 focus:shadow-[var(--shadow-focus)]"
          />
        </div>
        {!pendingOnly ? (
          <div className="space-y-2 sm:w-52">
            <label
              htmlFor="status"
              className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500"
            >
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
        ) : null}
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] bg-primary-600 px-5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Apply
        </button>
        {hasFilters ? (
          <Link
            href={basePath}
            className="inline-flex h-11 items-center justify-center rounded-[var(--radius-md)] border border-border-strong px-5 text-sm font-medium hover:bg-surface-muted"
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
          <div className="hidden overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] lg:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-surface-muted/80">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Brand name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Owner name
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Industry
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Submitted
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>
                  {showQuickActions ? (
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Actions
                    </th>
                  ) : (
                    <th className="px-4 py-3" />
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="transition-colors hover:bg-primary-50/30"
                  >
                    <td className="px-4 py-3.5 font-medium text-foreground">
                      {brand.business_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-foreground">
                          {brand.owner_name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">{brand.owner_email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {brand.industry ?? "—"}
                    </td>
                    <td className="px-4 py-3.5 text-slate-500">
                      {formatDate(brand.submitted_at ?? brand.created_at) ?? "—"}
                    </td>
                    <td className="px-4 py-3.5">
                      <AdminBrandStatusBadge
                        brand={brand}
                        pulse={brand.status === "submitted"}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/brands/${brand.id}`}
                          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-muted"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
                        </Link>
                        {showQuickActions && brand.status === "submitted" ? (
                          <>
                            <Link
                              href={`/admin/brands/${brand.id}#approve`}
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Approve
                            </Link>
                            <Link
                              href={`/admin/brands/${brand.id}#changes`}
                              className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
                            >
                              <MessageSquareWarning className="h-3.5 w-3.5" />
                              Changes
                            </Link>
                            <Link
                              href={`/admin/brands/${brand.id}#reject`}
                              className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-100"
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Reject
                            </Link>
                          </>
                        ) : null}
                      </div>
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
            className="grid gap-4 lg:hidden"
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
                        {brand.owner_name ?? brand.owner_email}
                      </p>
                    </div>
                    <AdminBrandStatusBadge brand={brand} />
                  </div>
                  <div className="mt-3 flex justify-between text-xs text-slate-500">
                    <span>{brand.industry ?? "—"}</span>
                    <span>
                      {formatDate(brand.submitted_at ?? brand.created_at)}
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {totalPages > 1 ? (
            <div className="flex items-center justify-between gap-4 rounded-[var(--radius-lg)] border border-border bg-surface px-4 py-3 text-sm">
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
                      pending: pendingOnly,
                    })}
                    className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-muted"
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
                      pending: pendingOnly,
                    })}
                    className="rounded-lg border border-border px-3 py-1.5 font-medium hover:bg-surface-muted"
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
