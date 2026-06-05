import { NextResponse } from "next/server";

import { API_ERRORS, jsonResponse, PUBLIC_API_CACHE_SECONDS } from "@/lib/api/response";
import { isValidUuid } from "@/lib/api/validate";
import { getPublishedBrandById } from "@/lib/public/brands";
import type { PublicBrandDetailResponse } from "@/types/api/public-brand";

export const revalidate = 60;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Cache-Control": `public, s-maxage=${PUBLIC_API_CACHE_SECONDS}`,
    },
  });
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  if (!isValidUuid(id)) {
    return API_ERRORS.invalidId();
  }

  const result = await getPublishedBrandById(id);

  if (result.error === "SERVICE_UNAVAILABLE") {
    return API_ERRORS.serviceUnavailable();
  }

  if (result.error === "INTERNAL_ERROR") {
    return API_ERRORS.internal();
  }

  if (!result.data) {
    return API_ERRORS.notFound();
  }

  const body: PublicBrandDetailResponse = {
    data: result.data,
  };

  return jsonResponse(body);
}
