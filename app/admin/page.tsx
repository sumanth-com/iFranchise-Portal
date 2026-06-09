import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AdminActivityFeed } from "@/components/admin/admin-activity-feed";
import { AdminKpis } from "@/components/admin/admin-kpis";
import { BrandTable } from "@/components/admin/BrandTable";
import { requireAdmin } from "@/lib/auth/session";
import {
  getAdminBrands,
  getAdminDashboardStats,
  getAdminRecentActivity,
} from "@/lib/admin/queries";

type AdminDashboardPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const page = Math.max(1, Number(params.page) || 1);

  const [{ stats, error: statsError }, { activity }, queueResult] =
    await Promise.all([
      getAdminDashboardStats(),
      getAdminRecentActivity(),
      getAdminBrands({ pendingOnly: true, page, pageSize: 5 }),
    ]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
            Admin portal
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Monitor brand submissions, review queue health, and publishing
            activity across the iFranchise platform.
          </p>
        </div>
        <Link
          href="/admin/reviews"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          Open review queue
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {statsError ? (
        <p
          className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {statsError}
        </p>
      ) : null}

      <AdminKpis stats={stats} />

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AdminActivityFeed activity={activity} compact />
        </div>
        <div className="xl:col-span-2 rounded-[var(--radius-lg)] border border-amber-200 bg-amber-50/40 p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Queue snapshot
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-amber-900">
            {stats.pendingReviews}
          </p>
          <p className="mt-1 text-sm text-amber-800/80">
            {stats.pendingReviews === 1
              ? "brand awaiting review"
              : "brands awaiting review"}
          </p>
          <Link
            href="/admin/reviews"
            className="mt-4 inline-flex text-sm font-medium text-amber-900 hover:underline"
          >
            Review now →
          </Link>
        </div>
      </div>

      <BrandTable
        brands={queueResult.brands}
        total={queueResult.total}
        page={queueResult.page}
        pageSize={queueResult.pageSize}
        basePath="/admin"
        title="Pending review queue"
        description="Brands submitted and awaiting your decision."
        pendingOnly
        showQuickActions
      />
    </div>
  );
}
