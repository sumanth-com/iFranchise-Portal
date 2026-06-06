/**
 * Verify production database is ready for brand wizard + uploads.
 *
 * Run: npx tsx scripts/verify-production-db.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *   SUPABASE_DB_PASSWORD (optional, for deep RLS function check)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

import { BRAND_ASSETS_BUCKET } from "../lib/assets/constants";

const { Client } = pg;

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function projectRef(url: string): string | null {
  const match = url.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

async function checkRlsFunction(password: string, ref: string): Promise<boolean> {
  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();
    const { rows } = await client.query<{ prosrc: string }>(
      `select prosrc from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'is_brand_owner_editable'`,
    );
    await client.end();
    return (rows[0]?.prosrc ?? "").includes("submitted");
  } catch {
    try {
      await client.end();
    } catch {
      /* ignore */
    }
    return false;
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey);
  const ref = projectRef(url);

  console.log("\n=== PRODUCTION DB VERIFICATION ===\n");

  let failed = 0;

  const { error: bucketError } = await admin.storage.getBucket(BRAND_ASSETS_BUCKET);
  if (bucketError) {
    console.log("[FAIL] Storage bucket brand-assets:", bucketError.message);
    failed++;
  } else {
    console.log("[OK]   Storage bucket brand-assets");
  }

  const { error: tableError } = await admin.from("brand_assets").select("id").limit(1);
  if (tableError) {
    console.log("[FAIL] Table brand_assets:", tableError.message);
    failed++;
  } else {
    console.log("[OK]   Table brand_assets");
  }

  const { error: enumError } = await admin
    .from("brand_assets")
    .select("id")
    .eq("asset_type", "document")
    .limit(0);

  if (enumError?.message?.includes("invalid input value for enum")) {
    console.log("[FAIL] Enum asset_type missing 'document'");
    failed++;
  } else if (enumError) {
    console.log("[WARN] Enum probe:", enumError.message);
  } else {
    console.log("[OK]   Enum asset_type includes document");
  }

  if (dbPassword && ref) {
    const rlsOk = await checkRlsFunction(dbPassword, ref);
    if (rlsOk) {
      console.log("[OK]   RLS is_brand_owner_editable allows submitted");
    } else {
      console.log("[FAIL] RLS is_brand_owner_editable missing submitted status");
      failed++;
    }
  } else {
    console.log("[SKIP] RLS function check (add SUPABASE_DB_PASSWORD for full audit)");
    console.log("       Run supabase/APPLY_TO_PRODUCTION.sql if uploads fail with RLS errors");
  }

  console.log("");
  if (failed > 0) {
    console.log(`RESULT: ${failed} check(s) FAILED\n`);
    console.log("Fix: Supabase Dashboard → SQL Editor → run:");
    console.log("  supabase/APPLY_TO_PRODUCTION.sql\n");
    console.log("Or: npx tsx scripts/apply-production-db.ts\n");
    process.exit(1);
  }

  console.log("RESULT: All checks passed. Brand wizard uploads should work.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
