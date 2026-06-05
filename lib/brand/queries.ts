import {
  BRAND_CORE_FIELDS,
  BRAND_FULL_SELECT,
} from "@/lib/brand/fields";
import { normalizeBrand } from "@/lib/brand/normalize";
import { createClient } from "@/lib/supabase/server";
import type { Brand } from "@/types/brand";

export const BRAND_SELECT_FIELDS = BRAND_FULL_SELECT;

export type GetClientBrandResult =
  | { brand: Brand | null; error: null }
  | { brand: null; error: string };

export async function getClientBrand(userId: string): Promise<GetClientBrandResult> {
  const supabase = await createClient();

  const full = await supabase
    .from("brands")
    .select(BRAND_FULL_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (!full.error && full.data) {
    return {
      brand: normalizeBrand(
        full.data as unknown as Parameters<typeof normalizeBrand>[0],
      ),
      error: null,
    };
  }

  const msg = full.error?.message ?? "";
  const missingExtended =
    msg.includes("does not exist") ||
    msg.includes("investment_min") ||
    msg.includes("category");

  if (!missingExtended && full.error) {
    return {
      brand: null,
      error: "Unable to load your brand profile. Please refresh and try again.",
    };
  }

  const core = await supabase
    .from("brands")
    .select(BRAND_CORE_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (core.error) {
    return {
      brand: null,
      error: "Unable to load your brand profile. Please refresh and try again.",
    };
  }

  if (!core.data) {
    return { brand: null, error: null };
  }

  return {
    brand: normalizeBrand(
      core.data as unknown as Parameters<typeof normalizeBrand>[0],
    ),
    error: null,
  };
}
