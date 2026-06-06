import { BRAND_EXTENDED_FIELDS, BRAND_FULL_SELECT } from "@/lib/brand/fields";
import type { SupabaseClient } from "@supabase/supabase-js";

const EXTENDED_COLUMN_LIST = BRAND_EXTENDED_FIELDS.split(", ").map((c) => c.trim());

let cachedMissingColumns: Set<string> | null = null;

function isMissingColumnError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find") ||
    lower.includes("schema cache")
  );
}

function parseMissingColumnName(message: string): string | null {
  const patterns = [
    /column ['"]?([\w]+)['"]? (?:of relation|does not exist)/i,
    /Could not find the '([\w]+)' column/i,
    /'([\w]+)' column/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

/** Probe DB once per process; log warnings for missing columns; never throws. */
export async function getMissingBrandColumns(
  supabase: SupabaseClient,
): Promise<Set<string>> {
  if (cachedMissingColumns) return cachedMissingColumns;

  const missing = new Set<string>();

  try {
    const probe = await supabase.from("brands").select(BRAND_FULL_SELECT).limit(1);

    if (!probe.error) {
      cachedMissingColumns = missing;
      return missing;
    }

    if (!isMissingColumnError(probe.error.message)) {
      console.warn("[brand schema] Full select probe failed:", probe.error.message);
      cachedMissingColumns = missing;
      return missing;
    }

    for (const column of EXTENDED_COLUMN_LIST) {
      const { error } = await supabase.from("brands").select(column).limit(0);
      if (error && isMissingColumnError(error.message)) {
        console.warn(`[brand schema] Missing column: ${column}`);
        missing.add(column);
      }
    }
  } catch (err) {
    console.warn("[brand schema] Column validation failed:", err);
  }

  cachedMissingColumns = missing;
  return missing;
}

export async function validateBrandSchemaOnLoad(
  supabase: SupabaseClient,
): Promise<{ missingColumns: string[] }> {
  const missing = await getMissingBrandColumns(supabase);
  if (missing.size > 0) {
    console.warn(
      `[brand schema] ${missing.size} extended column(s) unavailable; using safe fallbacks.`,
    );
  }
  return { missingColumns: [...missing] };
}

export function omitMissingBrandColumns<T extends Record<string, unknown>>(
  row: T,
  missing: Set<string>,
): Partial<T> {
  if (missing.size === 0) return row;
  const out = { ...row };
  for (const key of missing) {
    if (key in out) delete out[key];
  }
  return out;
}

export async function updateBrandRowSafe(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
  brandId: string,
  userId: string,
  missingKnown: Set<string>,
): Promise<{ error: string | null }> {
  let payload = { ...omitMissingBrandColumns(row, missingKnown) };

  for (let attempt = 0; attempt < 25; attempt++) {
    const { error } = await supabase
      .from("brands")
      .update(payload)
      .eq("id", brandId)
      .eq("user_id", userId);

    if (!error) return { error: null };

    if (error.message?.toLowerCase().includes("row-level security")) {
      console.error("[brand schema] RLS UPDATE violation on brands", {
        brandId,
        userId,
        operation: "UPDATE",
        payload,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    const col = parseMissingColumnName(error.message);
    if (col && col in payload) {
      console.warn(`[brand schema] Omitting missing column on save: ${col}`);
      const next = { ...payload };
      delete next[col];
      missingKnown.add(col);
      payload = next;
      continue;
    }

    return { error: error.message };
  }

  return { error: "Unable to save after removing unavailable fields." };
}

export async function insertBrandRowSafe(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
  userId: string,
  missingKnown: Set<string>,
): Promise<{ id: string | null; error: string | null }> {
  let payload: Record<string, unknown> = {
    user_id: userId,
    status: "draft",
    ...omitMissingBrandColumns(row, missingKnown),
  };

  for (let attempt = 0; attempt < 25; attempt++) {
    const { data, error } = await supabase
      .from("brands")
      .insert(payload)
      .select("id")
      .single();

    if (!error && data) return { id: data.id, error: null };

    if (!error) return { id: null, error: "Failed to create brand." };

    if (error.message?.toLowerCase().includes("row-level security")) {
      console.error("[brand schema] RLS INSERT violation on brands", {
        userId,
        operation: "INSERT",
        payload,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    const col = parseMissingColumnName(error.message);
    if (col && col in payload) {
      console.warn(`[brand schema] Omitting missing column on create: ${col}`);
      const next = { ...payload };
      delete next[col];
      missingKnown.add(col);
      payload = next;
      continue;
    }

    return { id: null, error: error.message };
  }

  return { id: null, error: "Unable to create brand after removing unavailable fields." };
}
