/**
 * Run: npx tsx scripts/diagnose-upload.ts
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

import { BRAND_ASSETS_BUCKET } from "../lib/assets/constants";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    console.error("Could not read .env.local");
    process.exit(1);
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey);
  const publishable = publishableKey ? createClient(url, publishableKey) : null;

  console.log("\n=== UPLOAD DIAGNOSTICS ===\n");

  const { data: bucketData, error: bucketError } =
    await admin.storage.getBucket(BRAND_ASSETS_BUCKET);
  console.log(
    `[BUCKET service-role] ${BRAND_ASSETS_BUCKET}`,
    bucketError ? `ERROR: ${bucketError.message}` : "OK",
  );
  if (bucketData) {
    console.log("  file_size_limit:", bucketData.file_size_limit);
    console.log("  allowed_mime_types:", bucketData.allowed_mime_types);
  }

  if (publishable) {
    const { error: pubError } = await publishable.storage.getBucket(BRAND_ASSETS_BUCKET);
    console.log(
      `[BUCKET publishable-key] ${BRAND_ASSETS_BUCKET}`,
      pubError ? `expected for private bucket: ${pubError.message}` : "OK",
    );
  }

  const { error: tableError } = await admin.from("brand_assets").select("id").limit(1);
  console.log("[TABLE brand_assets]", tableError ? `ERROR: ${tableError.message}` : "OK");

  const { error: enumProbeError } = await admin
    .from("brand_assets")
    .select("id")
    .eq("asset_type", "document")
    .limit(0);
  if (enumProbeError?.message?.includes("invalid input value for enum")) {
    console.log(
      "[ENUM asset_type] MISSING 'document' — run: npx tsx scripts/apply-asset-type-enum.ts",
    );
  } else if (enumProbeError) {
    console.log("[ENUM asset_type] probe error:", enumProbeError.message);
  } else {
    console.log("[ENUM asset_type] document value OK");
  }

  console.log(
    "[SERVICE_ROLE_KEY]",
    serviceKey ? "SET (required for server-side uploads)" : "MISSING",
  );

  if (bucketError) {
    console.log("\nFix: npx tsx scripts/provision-brand-assets-storage.ts\n");
    process.exit(1);
  }

  console.log(
    "\nIf uploads fail with RLS errors, run ONCE in Supabase SQL Editor:",
  );
  console.log("  supabase/APPLY_TO_PRODUCTION.sql");
  console.log("\nThen verify: npx tsx scripts/verify-production-db.ts\n");
}

main().catch(console.error);
