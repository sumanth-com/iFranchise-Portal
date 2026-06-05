import { NextResponse } from "next/server";

import { API_ERRORS, jsonResponse, PUBLIC_API_CACHE_SECONDS } from "@/lib/api/response";
import { getPublishedBrands } from "@/lib/public/brands";
import type { PublicBrandsListResponse } from "@/types/api/public-brand";

export const revalidate = 60;

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

export async function GET() {
  const result = await getPublishedBrands();

  if (result.error === "SERVICE_UNAVAILABLE") {
    return API_ERRORS.serviceUnavailable();
  }

  if (result.error === "INTERNAL_ERROR" || !result.data) {
    return API_ERRORS.internal();
  }

  const body: PublicBrandsListResponse = {
    data: result.data,
    meta: { count: result.data.length },
  };

  return jsonResponse(body);
}
