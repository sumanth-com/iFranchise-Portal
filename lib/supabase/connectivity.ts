import { getSupabaseEnv } from "./env";
import { fetchWithTimeout } from "./fetch";

const HEALTH_TIMEOUT_MS = 8_000;

export type ConnectivityResult = {
  ok: boolean;
  latencyMs: number | null;
  error: string | null;
};

/**
 * Lightweight preflight before login/signup. Fails fast with a clear message
 * when Supabase is unreachable — avoids hanging forms or raw "fetch failed".
 */
export async function verifySupabaseConnectivity(): Promise<ConnectivityResult> {
  const { url, publishableKey } = getSupabaseEnv();

  if (!url || !publishableKey) {
    return {
      ok: false,
      latencyMs: null,
      error: "Supabase environment variables are not configured.",
    };
  }

  const started = Date.now();

  try {
    const response = await fetchWithTimeout(
      `${url}/auth/v1/health`,
      {
        method: "GET",
        headers: { apikey: publishableKey },
      },
      HEALTH_TIMEOUT_MS,
    );

    const latencyMs = Date.now() - started;

    if (!response.ok) {
      return {
        ok: false,
        latencyMs,
        error: `Authentication service returned status ${response.status}.`,
      };
    }

    return { ok: true, latencyMs, error: null };
  } catch (error) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      error:
        error instanceof Error ? error.message : "Connection check failed.",
    };
  }
}
