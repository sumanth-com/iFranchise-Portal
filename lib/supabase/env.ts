const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

function normalizeSupabaseUrl(url: string): string {
  let normalized = url.trim();

  // Common misconfiguration: pasting the REST endpoint instead of project URL.
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

export function getSupabaseEnv() {
  return {
    url: SUPABASE_URL ? normalizeSupabaseUrl(SUPABASE_URL) : SUPABASE_URL,
    publishableKey: SUPABASE_PUBLISHABLE_KEY,
  };
}

export function assertSupabaseEnv(): { url: string; publishableKey: string } {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL. Add it to .env.local and restart the dev server.",
    );
  }

  if (!publishableKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY. Add it to .env.local and restart the dev server.",
    );
  }

  validateSupabaseUrl(url);

  return { url, publishableKey };
}
