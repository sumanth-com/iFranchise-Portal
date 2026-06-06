/**
 * Provision the brand-assets storage bucket.
 *
 * Run: npx tsx scripts/provision-brand-assets-storage.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 *
 * Optional (applies RLS policies via direct SQL):
 *   SUPABASE_DB_PASSWORD
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

async function applyPoliciesWithPg(url: string, password: string) {
  const ref = projectRef(url);
  if (!ref) throw new Error("Could not parse project ref from SUPABASE_URL");

  const sql = [
    readFileSync(
      resolve(process.cwd(), "supabase/migrations/012_brand_owner_rls_complete.sql"),
      "utf8",
    ),
    readFileSync(
      resolve(process.cwd(), "supabase/migrations/011_ensure_asset_type_enum.sql"),
      "utf8",
    ),
    readFileSync(
      resolve(process.cwd(), "supabase/migrations/009_brand_assets_storage_complete.sql"),
      "utf8",
    ),
    readFileSync(
      resolve(process.cwd(), "supabase/migrations/010_fix_brand_owner_editable.sql"),
      "utf8",
    ),
  ].join("\n");

  const hosts = [
    `db.${ref}.supabase.co`,
    `aws-0-us-east-1.pooler.supabase.com`,
    `aws-0-eu-west-1.pooler.supabase.com`,
    `aws-0-ap-south-1.pooler.supabase.com`,
  ];

  let lastError: unknown;

  for (const host of hosts) {
    const client = new Client({
      host,
      port: host.includes("pooler") ? 6543 : 5432,
      user: host.includes("pooler") ? `postgres.${ref}` : "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000,
    });

    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log(`[POLICIES] Applied via ${host}`);
      return;
    } catch (err) {
      lastError = err;
      try {
        await client.end();
      } catch {
        /* ignore */
      }
    }
  }

  throw lastError;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n=== PROVISION brand-assets STORAGE ===\n");

  const { data: existing, error: getError } = await admin.storage.getBucket(BRAND_ASSETS_BUCKET);

  if (getError && !getError.message.toLowerCase().includes("not found")) {
    console.error("[getBucket] Unexpected error:", getError.message);
    process.exit(1);
  }

  if (existing) {
    console.log(`[BUCKET] ${BRAND_ASSETS_BUCKET} exists — updating limits`);
    const { error: updateError } = await admin.storage.updateBucket(BRAND_ASSETS_BUCKET, {
      public: false,
      fileSizeLimit: 20971520,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    if (updateError) {
      console.error("[updateBucket] ERROR:", updateError.message);
      process.exit(1);
    }
  } else {
    const { error: createError } = await admin.storage.createBucket(BRAND_ASSETS_BUCKET, {
      public: false,
      fileSizeLimit: 20971520,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
    });
    if (createError) {
      console.error("[createBucket] ERROR:", createError.message);
      process.exit(1);
    }
    console.log(`[BUCKET] Created ${BRAND_ASSETS_BUCKET}`);
  }

  const { data: verify, error: verifyError } = await admin.storage.getBucket(BRAND_ASSETS_BUCKET);
  if (verifyError || !verify) {
    console.error("[VERIFY] Bucket not visible after create:", verifyError?.message);
    process.exit(1);
  }

  console.log("[VERIFY] Bucket OK");
  console.log("  file_size_limit:", verify.file_size_limit);
  console.log("  allowed_mime_types:", verify.allowed_mime_types);

  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (dbPassword) {
    try {
      await applyPoliciesWithPg(url, dbPassword);
    } catch (err) {
      console.error("[POLICIES] SQL apply failed:", err);
      console.log("\nRun manually in Supabase SQL Editor:");
      console.log("  supabase/migrations/009_brand_assets_storage_complete.sql\n");
    }
  } else {
    console.log("\n[POLICIES] Optional: add SUPABASE_DB_PASSWORD to .env.local to auto-apply RLS.");
    console.log("Or run in Supabase SQL Editor:");
    console.log("  supabase/migrations/009_brand_assets_storage_complete.sql");
  }

  console.log("\n=== PROVISION COMPLETE ===\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
