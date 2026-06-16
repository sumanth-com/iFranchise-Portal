import { verifySupabaseConnectivity } from "@/lib/supabase/connectivity";
import {
  getServiceRoleKey,
} from "@/lib/supabase/service";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";

export type AuthDiagnostics = {
  environment: string;
  vercelEnv: string | null;
  nodeEnv: string;
  siteUrl: string | null;
  supabase: {
    configured: boolean;
    projectRef: string | null;
    urlHost: string | null;
    keySource: "publishable" | "anon" | null;
    serviceRoleConfigured: boolean;
    issues: string[];
  };
  connectivity: {
    ok: boolean;
    latencyMs: number | null;
    error: string | null;
  };
  authProviders: {
    emailPassword: "available" | "unavailable";
  };
  projectRefMatch: {
    expected: string | null;
    matches: boolean | null;
  };
  checkedAt: string;
};

function extractProjectRef(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/i);
  return match?.[1] ?? null;
}

function extractUrlHost(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

export async function getAuthDiagnostics(): Promise<AuthDiagnostics> {
  const envStatus = getSupabaseEnvStatus();
  const connectivity = await verifySupabaseConnectivity();

  const vercelEnv = process.env.VERCEL_ENV ?? null;
  const expectedProjectRef = process.env.SUPABASE_PROJECT_REF?.trim() ?? null;
  const projectRef = extractProjectRef(envStatus.url);
  const projectRefMatch =
    expectedProjectRef && projectRef
      ? {
          expected: expectedProjectRef,
          matches: expectedProjectRef === projectRef,
        }
      : { expected: expectedProjectRef, matches: null };

  const environment =
    vercelEnv === "production"
      ? "production"
      : vercelEnv === "preview"
        ? "preview"
        : process.env.NODE_ENV === "production"
          ? "production"
          : "development";

  return {
    environment,
    vercelEnv,
    nodeEnv: process.env.NODE_ENV ?? "development",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? null,
    supabase: {
      configured: envStatus.configured,
      projectRef,
      urlHost: extractUrlHost(envStatus.url),
      keySource: envStatus.keySource,
      serviceRoleConfigured: Boolean(getServiceRoleKey()),
      issues: envStatus.issues,
    },
    connectivity: {
      ok: connectivity.ok,
      latencyMs: connectivity.latencyMs,
      error: connectivity.error,
    },
    authProviders: {
      emailPassword: envStatus.configured && connectivity.ok
        ? "available"
        : "unavailable",
    },
    projectRefMatch,
    checkedAt: new Date().toISOString(),
  };
}
