/**
 * Apply brand owner RLS fixes (migration 012).
 *
 * Run: npx tsx scripts/apply-brand-rls-fix.ts
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
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD in .env.local",
    );
    console.error("\nRun manually in Supabase SQL Editor:");
    console.error("  supabase/migrations/012_brand_owner_rls_complete.sql\n");
    process.exit(1);
  }

  const ref = projectRef(url);
  if (!ref) {
    console.error("Could not parse project ref from NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  const sql = readFileSync(
    resolve(process.cwd(), "supabase/migrations/012_brand_owner_rls_complete.sql"),
    "utf8",
  );

  const hosts = [
    `db.${ref}.supabase.co`,
    `aws-0-us-east-1.pooler.supabase.com`,
    `aws-0-eu-west-1.pooler.supabase.com`,
    `aws-0-ap-south-1.pooler.supabase.com`,
  ];

  console.log("\n=== APPLY brand owner RLS (012) ===\n");

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

      const { rows: fnRows } = await client.query<{ prosrc: string }>(
        `select prosrc from pg_proc p
         join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname = 'is_brand_owner_editable'`,
      );

      const fnBody = fnRows[0]?.prosrc ?? "";
      const hasSubmitted = fnBody.includes("submitted");

      await client.end();

      console.log(`[RLS] Applied via ${host}`);
      console.log(
        "  is_brand_owner_editable includes submitted:",
        hasSubmitted ? "YES" : "NO — verify manually",
      );
      console.log("\n=== COMPLETE ===\n");
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

  console.error("[RLS] Failed:", lastError);
  console.log("\nRun manually in Supabase SQL Editor:");
  console.log("  supabase/migrations/012_brand_owner_rls_complete.sql\n");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
