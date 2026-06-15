import { BrandDirectory } from "@/components/admin/brands/brand-directory";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands } from "@/lib/admin/queries";
import { ADMIN_PAGE_SIZE } from "@/types/admin";
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

type BrandsPageProps = {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
};

export default async function AdminBrandsPage({ searchParams }: BrandsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const statusFilter = parseStatusFilter(params.status);
  const searchQuery = params.q?.trim() || null;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getAdminBrands({
    status: statusFilter,
    query: searchQuery,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Brand management
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          All brands
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Browse franchise listings in a visual directory — logos, owners, and workflow status at a glance.
        </p>
      </div>

      {result.error ? (
        <p
          className="rounded-[var(--radius-md)] bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {result.error}
        </p>
      ) : null}

      <BrandDirectory
        brands={result.brands}
        statusFilter={params.status ?? ""}
        searchQuery={params.q ?? ""}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/admin/brands"
      />
    </div>
  );
}
