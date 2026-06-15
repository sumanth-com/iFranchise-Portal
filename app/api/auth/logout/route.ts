import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import {
  applyNoStoreHeaders,
  clearSupabaseAuthCookies,
} from "@/lib/auth/cookies";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { fetchWithTimeoutServer } from "@/lib/supabase/fetch-server";

async function buildLogoutResponse(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("logged_out", "1");

  const response = NextResponse.redirect(loginUrl);
  applyNoStoreHeaders(response);

  const { url, publishableKey } = getSupabaseEnv();
  if (!url || !publishableKey) {
    clearSupabaseAuthCookies(request, response);
    return response;
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(url, publishableKey, {
    global: { fetch: fetchWithTimeoutServer },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    // Continue — still clear cookies below.
  }

  clearSupabaseAuthCookies(request, response);
  return response;
}

export async function GET(request: NextRequest) {
  return buildLogoutResponse(request);
}

export async function POST(request: NextRequest) {
  return buildLogoutResponse(request);
}
