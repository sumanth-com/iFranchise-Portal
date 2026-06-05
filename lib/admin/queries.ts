import { BRAND_SELECT_FIELDS } from "@/lib/brand/queries";
import { createClient } from "@/lib/supabase/server";
import type { AdminBrandDetail, AdminBrandListItem } from "@/types/admin";
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

export async function getAdminBrands(filters: {
  status?: BrandStatus | null;
  query?: string | null;
}): Promise<{ brands: AdminBrandListItem[]; error: string | null }> {
  const supabase = await createClient();

  let request = supabase
    .from("brands")
    .select(
      "id, business_name, industry, status, created_at, profiles!brands_user_id_fkey (email)",
    )
    .order("created_at", { ascending: false });

  if (filters.status) {
    request = request.eq("status", filters.status);
  }

  if (filters.query) {
    request = request.ilike("business_name", `%${filters.query}%`);
  }

  const { data, error } = await request;

  if (error) {
    return {
      brands: [],
      error: "Unable to load brands. Please refresh and try again.",
    };
  }

  const brands = (data ?? []).map((row) => ({
    id: row.id,
    business_name: row.business_name,
    industry: row.industry,
    status: row.status,
    created_at: row.created_at,
    owner_email: getOwnerEmail(
      row.profiles as ProfileEmbed | ProfileEmbed[],
    ),
  })) as AdminBrandListItem[];

  return { brands, error: null };
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
