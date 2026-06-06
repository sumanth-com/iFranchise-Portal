/**
 * Apply all production database fixes in one run.
 *
 * Run: npx tsx scripts/apply-production-db.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_DB_PASSWORD
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import pg from "pg";

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

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!url || !password) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD");
    console.error("\nRun manually in Supabase SQL Editor:");
    console.error("  supabase/APPLY_TO_PRODUCTION.sql\n");
    process.exit(1);
  }

  const ref = projectRef(url);
  if (!ref) process.exit(1);

  const sql = readFileSync(
    resolve(process.cwd(), "supabase/APPLY_TO_PRODUCTION.sql"),
    "utf8",
  );

  const hosts = [
    `db.${ref}.supabase.co`,
    `aws-0-ap-south-1.pooler.supabase.com`,
    `aws-0-us-east-1.pooler.supabase.com`,
    `aws-0-eu-west-1.pooler.supabase.com`,
  ];

  console.log("\n=== APPLY PRODUCTION DATABASE FIXES ===\n");

  let lastError: unknown;

  for (const host of hosts) {
    const client = new Client({
      host,
      port: host.includes("pooler") ? 6543 : 5432,
      user: host.includes("pooler") ? `postgres.${ref}` : "postgres",
      password,
      database: "postgres",
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 12000,
    });

    try {
      await client.connect();
      await client.query(sql);
      await client.end();
      console.log(`[OK] Applied via ${host}\n`);
      console.log("Next: npx tsx scripts/verify-production-db.ts\n");
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

  console.error("[FAIL]", lastError);
  console.log("\nRun manually: supabase/APPLY_TO_PRODUCTION.sql\n");
  process.exit(1);
}

main().catch(console.error);
