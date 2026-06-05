import { NextResponse } from "next/server";

import type { ApiErrorBody } from "@/types/api/public-brand";

export const PUBLIC_API_CACHE_SECONDS = 60;

export function jsonResponse<T>(data: T, init?: ResponseInit): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set(
    "Cache-Control",
    `public, s-maxage=${PUBLIC_API_CACHE_SECONDS}, stale-while-revalidate=300`,
  );
  headers.set("Access-Control-Allow-Origin", "*");
  headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");

  return NextResponse.json(data, {
    ...init,
    headers,
  });
}

export function apiError(
  code: string,
  message: string,
  status: number,
): NextResponse<ApiErrorBody> {
  return NextResponse.json(
    { error: { code, message } },
    { status },
  );
}

export const API_ERRORS = {
  notFound: () => apiError("NOT_FOUND", "Brand not found.", 404),
  invalidId: () => apiError("INVALID_ID", "Brand ID is not valid.", 400),
  serviceUnavailable: () =>
    apiError(
      "SERVICE_UNAVAILABLE",
      "Public API is not configured. Set SUPABASE_SERVICE_ROLE_KEY.",
      503,
    ),
  internal: () =>
    apiError("INTERNAL_ERROR", "Something went wrong. Please try again later.", 500),
} as const;
