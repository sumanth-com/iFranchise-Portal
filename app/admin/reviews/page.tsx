import { BrandTable } from "@/components/admin/BrandTable";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminBrands } from "@/lib/admin/queries";
import { ADMIN_PAGE_SIZE } from "@/types/admin";

type ReviewsPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  await requireAdmin();
  const params = await searchParams;
  const searchQuery = params.q?.trim() || null;
  const page = Math.max(1, Number(params.page) || 1);

  const result = await getAdminBrands({
    pendingOnly: true,
    query: searchQuery,
    page,
    pageSize: ADMIN_PAGE_SIZE,
  });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Review system
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Pending review queue
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Review submitted brands, approve, request changes, or reject with
          feedback.
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

      <BrandTable
        brands={result.brands}
        searchQuery={params.q ?? ""}
        total={result.total}
        page={result.page}
        pageSize={result.pageSize}
        basePath="/admin/reviews"
        title="Awaiting review"
        description="All brands with pending review status."
        pendingOnly
        showQuickActions
      />
    </div>
  );
}
