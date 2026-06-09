import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import type { LeadWithBrand } from "@/types/lead";

type BrandEmbed = { business_name: string; user_id?: string } | null;

function mapLead(
  row: Record<string, unknown>,
): LeadWithBrand {
  const brands = row.brands as BrandEmbed | BrandEmbed[];
  const brand = Array.isArray(brands) ? brands[0] : brands;

  return {
    id: row.id as string,
    brand_id: row.brand_id as string,
    name: row.name as string,
    email: row.email as string,
    phone: (row.phone as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    message: (row.message as string | null) ?? null,
    status: row.status as LeadWithBrand["status"],
    source: row.source as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    brand_name: brand?.business_name ?? "—",
  };
}

export async function getAdminLeads(): Promise<{
  leads: LeadWithBrand[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, brand_id, name, email, phone, city, message, status, source, created_at, updated_at, brands!inner (business_name)",
    )
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("leads")) {
      return { leads: [], error: null };
    }
    return { leads: [], error: "Unable to load leads." };
  }

  return {
    leads: (data ?? []).map((row) => mapLead(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getClientLeads(userId: string): Promise<{
  leads: LeadWithBrand[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, brand_id, name, email, phone, city, message, status, source, created_at, updated_at, brands!inner (business_name, user_id)",
    )
    .eq("brands.user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    if (error.message.includes("leads")) {
      return { leads: [], error: null };
    }
    return { leads: [], error: "Unable to load leads." };
  }

  return {
    leads: (data ?? []).map((row) => mapLead(row as Record<string, unknown>)),
    error: null,
  };
}

export async function getLeadStats(): Promise<{
  total: number;
  new: number;
}> {
  const service = createServiceClient();
  if (!service) return { total: 0, new: 0 };

  const { data } = await service.from("leads").select("status");
  const rows = data ?? [];
  return {
    total: rows.length,
    new: rows.filter((r) => r.status === "new").length,
  };
}
