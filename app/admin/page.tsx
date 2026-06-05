import { AdminKpis } from "@/components/admin/admin-kpis";
import { BrandTable } from "@/components/admin/BrandTable";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands } from "@/lib/admin/queries";
import type { BrandStatus } from "@/types/brand";

const VALID_STATUSES = new Set<BrandStatus>([
  "draft",
  "submitted",
  "changes_requested",
  "approved",
  "rejected",
]);

function parseStatusFilter(value: string | undefined): BrandStatus | null {
  if (value && VALID_STATUSES.has(value as BrandStatus)) {
    return value as BrandStatus;
  }
  return null;
}

type AdminPageProps = {
  searchParams: Promise<{ status?: string; q?: string }>;
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter = parseStatusFilter(params.status);
  const searchQuery = params.q?.trim() || null;

  const { brands, error } = await getAdminBrands({
    status: statusFilter,
    query: searchQuery,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Command center
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Submission queue
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Review, approve, and publish franchise brands to the iFranchise website.
        </p>
      </div>

      {error ? (
        <p
          className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <AdminKpis brands={brands} />
      <BrandTable
        brands={brands}
        statusFilter={params.status ?? ""}
        searchQuery={params.q ?? ""}
      />
    </div>
  );
}
