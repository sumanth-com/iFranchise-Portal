/**
 * Apply complete workflow migrations to Supabase.
 * Run: npx tsx scripts/apply-workflow-migrations.ts
 * Requires SUPABASE_DB_PASSWORD in .env.local
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
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const password = process.env.SUPABASE_DB_PASSWORD;
  if (!url || !password) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_DB_PASSWORD");
    console.error("Run manually: supabase/APPLY_WORKFLOW_COMPLETE.sql");
    process.exit(1);
  }

  const ref = projectRef(url);
  if (!ref) process.exit(1);

  const sql = readFileSync(
    resolve(process.cwd(), "supabase/APPLY_WORKFLOW_COMPLETE.sql"),
    "utf8",
  );

  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  console.log("\n=== APPLY WORKFLOW MIGRATIONS ===\n");
  try {
    await client.connect();
    await client.query(sql);
    console.log("SUCCESS — migrations applied.\n");
    console.log("Next: npx tsx scripts/validate-workflow-e2e.ts\n");
  } catch (err) {
    console.error("FAILED:", err instanceof Error ? err.message : err);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

main();
