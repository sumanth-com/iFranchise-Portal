const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export type SupabaseEnvStatus = {
  configured: boolean;
  url: string | null;
  keyPresent: boolean;
  keySource: "publishable" | "anon" | null;
  issues: string[];
};

function normalizeSupabaseUrl(url: string): string {
  let normalized = url.trim();

  normalized = normalized.replace(/\/rest\/v1\/?$/, "");
  normalized = normalized.replace(/\/+$/, "");

  return normalized;
}

function validateSupabaseUrl(url: string): void {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      `Invalid NEXT_PUBLIC_SUPABASE_URL "${url}". Use your project URL, e.g. https://your-project.supabase.co`,
    );
  }

  if (!parsed.protocol.startsWith("http")) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL must start with http:// or https://",
    );
  }

  if (parsed.pathname !== "" && parsed.pathname !== "/") {
    throw new Error(
      `NEXT_PUBLIC_SUPABASE_URL must not include a path (got "${parsed.pathname}"). Use the project root URL only.`,
    );
  }
}

function resolveKeySource(): SupabaseEnvStatus["keySource"] {
  if (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) {
    return "publishable";
  }
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return "anon";
  }
  return null;
}

export function getSupabaseEnvStatus(): SupabaseEnvStatus {
  const issues: string[] = [];
  const keySource = resolveKeySource();
  const url = SUPABASE_URL ? normalizeSupabaseUrl(SUPABASE_URL) : null;
  const keyPresent = Boolean(SUPABASE_PUBLISHABLE_KEY?.trim());

  if (!SUPABASE_URL?.trim()) {
    issues.push(
      "Missing NEXT_PUBLIC_SUPABASE_URL in .env.local — add your Supabase project URL and restart the dev server.",
    );
  } else {
    try {
      validateSupabaseUrl(SUPABASE_URL.trim());
    } catch (error) {
      issues.push(
        error instanceof Error ? error.message : "Invalid Supabase URL.",
      );
    }
  }

  if (!keyPresent) {
    issues.push(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local — add your Supabase anon/publishable key and restart.",
    );
  }

  return {
    configured: issues.length === 0,
    url,
    keyPresent,
    keySource,
    issues,
  };
}

export function getSupabaseEnv() {
  return {
    url: SUPABASE_URL ? normalizeSupabaseUrl(SUPABASE_URL) : SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  };
}

export function assertSupabaseEnv(): { url: string; publishableKey: string } {
  const status = getSupabaseEnvStatus();

  if (!status.configured) {
    throw new Error(status.issues[0] ?? "Supabase is not configured.");
  }

  const { url, publishableKey } = getSupabaseEnv();
  return { url: url!, publishableKey: publishableKey! };
}
