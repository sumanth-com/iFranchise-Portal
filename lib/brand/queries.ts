import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/brand";

export const BRAND_SELECT_FIELDS =
  "id, user_id, business_name, tagline, description, website_url, contact_email, contact_phone, industry, status, admin_feedback, submitted_at, reviewed_at, reviewed_by, created_at, updated_at";

export type GetClientBrandResult =
  | { brand: Brand | null; error: null }
  | { brand: null; error: string };

export async function getClientBrand(userId: string): Promise<GetClientBrandResult> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("brands")
    .select(BRAND_SELECT_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    return {
      brand: null,
      error: "Unable to load your brand profile. Please refresh and try again.",
    };
  }

  return { brand: (data as Brand | null) ?? null, error: null };
}
