import { buildAdminActivityFeed } from "@/lib/admin/activity-feed";
import { BRAND_ASSETS_BUCKET, SIGNED_URL_EXPIRY_SECONDS } from "@/lib/assets/constants";
import { getAssetsAdminClient } from "@/lib/assets/storage-admin";
import { BRAND_SELECT_FIELDS } from "@/lib/brand/queries";
import { createClient } from "@/lib/supabase/server";
import type {
  AdminActivityItem,
  AdminBrandDetail,
  AdminBrandListItem,
  AdminBrandsQueryResult,
  AdminDashboardStats,
} from "@/types/admin";
import { ADMIN_PAGE_SIZE } from "@/types/admin";
import type { BrandStatus } from "@/types/brand";

type ProfileEmbed = { email: string; full_name: string | null } | null;

function getOwnerEmail(profiles: ProfileEmbed | ProfileEmbed[]): string {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return profile?.email ?? "—";
}

function getOwnerName(profiles: ProfileEmbed | ProfileEmbed[]): string | null {
  const profile = Array.isArray(profiles) ? profiles[0] : profiles;
  return profile?.full_name ?? null;
}

function mapBrandRow(
  row: {
    id: string;
    business_name: string;
    tagline: string | null;
    industry: string | null;
    status: BrandStatus;
    created_at: string;
    submitted_at: string | null;
    published_at: string | null;
    profiles: ProfileEmbed | ProfileEmbed[];
  },
  logoUrl: string | null,
): AdminBrandListItem {
  return {
    id: row.id,
    business_name: row.business_name,
    tagline: row.tagline,
    industry: row.industry,
    status: row.status,
    created_at: row.created_at,
    submitted_at: row.submitted_at,
    published_at: row.published_at,
    owner_email: getOwnerEmail(row.profiles),
    owner_name: getOwnerName(row.profiles),
    logo_url: logoUrl,
  };
}

async function fetchLogoUrlsForBrands(
  brandIds: string[],
): Promise<Map<string, string>> {
  const urlMap = new Map<string, string>();
  if (brandIds.length === 0) return urlMap;

  const supabase = await createClient();
  const { data } = await supabase
    .from("brand_assets")
    .select("brand_id, storage_path")
    .in("brand_id", brandIds)
    .eq("asset_type", "logo");

  const admin = getAssetsAdminClient();
  if (!admin || !data?.length) return urlMap;

  await Promise.all(
    data.map(async (row) => {
      const { data: signed } = await admin.storage
        .from(BRAND_ASSETS_BUCKET)
        .createSignedUrl(row.storage_path, SIGNED_URL_EXPIRY_SECONDS);
      if (signed?.signedUrl) {
        urlMap.set(row.brand_id, signed.signedUrl);
      }
    }),
  );

  return urlMap;
}

const LIST_SELECT =
  "id, business_name, tagline, industry, status, created_at, submitted_at, published_at, profiles!brands_user_id_fkey (email, full_name)";

export async function getAdminDashboardStats(): Promise<{
  stats: AdminDashboardStats;
  error: string | null;
}> {
  const supabase = await createClient();

  const [brandsResult, ownersResult] = await Promise.all([
    supabase.from("brands").select("status, published_at"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
  ]);

  if (brandsResult.error) {
    return {
      stats: {
        pendingReviews: 0,
        approvedBrands: 0,
        publishedBrands: 0,
        rejectedBrands: 0,
        totalBrands: 0,
        totalBrandOwners: 0,
      },
      error: "Unable to load dashboard stats.",
    };
  }

  const rows = brandsResult.data ?? [];
  const stats: AdminDashboardStats = {
    pendingReviews: rows.filter((b) => b.status === "submitted").length,
    approvedBrands: rows.filter(
      (b) => b.status === "approved" && !b.published_at,
    ).length,
    publishedBrands: rows.filter(
      (b) => b.status === "approved" && b.published_at,
    ).length,
    rejectedBrands: rows.filter((b) => b.status === "rejected").length,
    totalBrands: rows.length,
    totalBrandOwners: ownersResult.count ?? 0,
  };

  return { stats, error: null };
}

export async function getAdminRecentActivity(): Promise<{
  activity: AdminActivityItem[];
  error: string | null;
}> {
  const supabase = await createClient();

  const ACTIVITY_FIELDS =
    "id, business_name, status, created_at, updated_at, submitted_at, reviewed_at, published_at";

  const { data, error } = await supabase
    .from("brands")
    .select(ACTIVITY_FIELDS)
    .order("updated_at", { ascending: false })
    .limit(50);

  if (error) {
    return { activity: [], error: "Unable to load recent activity." };
  }

  const brands = (data ?? []) as Parameters<typeof buildAdminActivityFeed>[0];

  return { activity: buildAdminActivityFeed(brands), error: null };
}

export async function getAdminBrands(filters: {
  status?: BrandStatus | null;
  query?: string | null;
  page?: number;
  pageSize?: number;
  pendingOnly?: boolean;
}): Promise<AdminBrandsQueryResult> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = filters.pageSize ?? ADMIN_PAGE_SIZE;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let request = supabase
    .from("brands")
    .select(LIST_SELECT, { count: "exact" })
    .order("submitted_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (filters.pendingOnly) {
    request = request.eq("status", "submitted");
  } else if (filters.status) {
    request = request.eq("status", filters.status);
  }

  if (filters.query) {
    request = request.ilike("business_name", `%${filters.query}%`);
  }

  const { data, error, count } = await request.range(from, to);

  if (error) {
    return {
      brands: [],
      total: 0,
      page,
      pageSize,
      error: "Unable to load brands. Please refresh and try again.",
    };
  }

  const rows = data ?? [];
  const logoUrls = await fetchLogoUrlsForBrands(rows.map((row) => row.id));
  const brands = rows.map((row) =>
    mapBrandRow(row as Parameters<typeof mapBrandRow>[0], logoUrls.get(row.id) ?? null),
  );

  return {
    brands,
    total: count ?? 0,
    page,
    pageSize,
    error: null,
  };
}

export async function getAdminBrandById(
  brandId: string,
): Promise<{ brand: AdminBrandDetail | null; error: string | null }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("brands")
    .select(
      `${BRAND_SELECT_FIELDS}, profiles!brands_user_id_fkey (email, full_name)`,
    )
    .eq("id", brandId)
    .maybeSingle();

  if (error) {
    return {
      brand: null,
      error: "Unable to load brand details. Please try again.",
    };
  }

  if (!data) {
    return { brand: null, error: null };
  }

  const row = data as unknown as {
    profiles: ProfileEmbed | ProfileEmbed[];
  } & Omit<AdminBrandDetail, "owner_email" | "owner_name">;

  const { profiles, ...brand } = row;

  return {
    brand: {
      ...brand,
      owner_email: getOwnerEmail(profiles),
      owner_name: getOwnerName(profiles),
    },
    error: null,
  };
}
