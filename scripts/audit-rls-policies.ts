/**
 * Audit RLS policies for brand owner flows.
 *
 * Run: npx tsx scripts/audit-rls-policies.ts
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
    process.exit(1);
  }

  const ref = projectRef(url);
  if (!ref) process.exit(1);

  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  await client.connect();

  console.log("\n=== RLS POLICY AUDIT ===\n");

  const tables = ["brands", "brand_assets", "profiles"];

  for (const table of tables) {
    const { rows } = await client.query<{
      policyname: string;
      cmd: string;
      roles: string;
      qual: string | null;
      with_check: string | null;
    }>(
      `select policyname, cmd, roles::text, qual::text, with_check::text
       from pg_policies
       where schemaname = 'public' and tablename = $1
       order by policyname`,
      [table],
    );

    console.log(`[TABLE public.${table}] ${rows.length} policies`);
    for (const row of rows) {
      console.log(`  - ${row.policyname} (${row.cmd})`);
      if (row.qual) console.log(`    USING: ${row.qual.slice(0, 120)}...`);
      if (row.with_check)
        console.log(`    WITH CHECK: ${row.with_check.slice(0, 120)}...`);
    }
    console.log("");
  }

  const { rows: fnRows } = await client.query<{ prosrc: string }>(
    `select prosrc from pg_proc p
     join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.proname = 'is_brand_owner_editable'`,
  );

  const body = fnRows[0]?.prosrc ?? "(not found)";
  console.log("[FUNCTION is_brand_owner_editable]");
  console.log(body.trim());
  console.log("");
  console.log(
    "  submitted allowed:",
    body.includes("submitted") ? "YES" : "NO — RUN migration 012",
  );

  const { rows: missing } = await client.query<{ tablename: string }>(
    `select tablename from pg_tables
     where schemaname = 'public'
       and tablename in ('brand_documents', 'brand_gallery', 'brand_files')`,
  );
  if (missing.length === 0) {
    console.log("\n[INFO] Tables brand_documents, brand_gallery, brand_files do not exist.");
    console.log("       Asset metadata lives in public.brand_assets only.\n");
  }

  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
