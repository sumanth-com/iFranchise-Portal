/**
 * Live schema verification for super_admin migration path.
 * Run: npx tsx scripts/verify-schema-super-admin.ts
 */
import { createClient } from "@supabase/supabase-js";
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

async function queryViaPostgres(password: string, ref: string) {
  const client = new Client({
    host: `db.${ref}.supabase.co`,
    port: 5432,
    user: "postgres",
    password,
    database: "postgres",
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  });

  await client.connect();

  const profilesColumns = await client.query(`
    select column_name, data_type, udt_name, is_nullable, column_default
    from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
    order by ordinal_position
  `);

  const publicTables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE'
    order by table_name
  `);

  const enums = await client.query(`
    select t.typname as enum_name,
           array_agg(e.enumlabel order by e.enumsortorder) as enum_values
    from pg_type t
    join pg_enum e on t.oid = e.enumtypid
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public'
    group by t.typname
    order by t.typname
  `);

  const teamInvitations = await client.query(
    `select to_regclass('public.team_invitations') as regclass`,
  );

  const activityLogs = await client.query(
    `select to_regclass('public.activity_logs') as regclass`,
  );

  const teamRoleEnum = await client.query(`
    select exists (
      select 1
      from pg_type t
      join pg_namespace n on n.oid = t.typnamespace
      where n.nspname = 'public' and t.typname = 'team_role' and t.typtype = 'e'
    ) as exists
  `);

  await client.end();

  return {
    source: "postgres",
    profiles_columns: profilesColumns.rows,
    public_tables: publicTables.rows.map(
      (r: { table_name: string }) => r.table_name,
    ),
    enums: enums.rows,
    team_invitations_exists:
      teamInvitations.rows[0]?.regclass !== null,
    team_invitations_regclass: teamInvitations.rows[0]?.regclass,
    activity_logs_exists: activityLogs.rows[0]?.regclass !== null,
    activity_logs_regclass: activityLogs.rows[0]?.regclass,
    team_role_enum_exists: teamRoleEnum.rows[0]?.exists === true,
  };
}

async function probeViaRest(url: string, serviceKey: string) {
  const admin = createClient(url, serviceKey);
  const columnProbes = [
    "id",
    "email",
    "full_name",
    "role",
    "team_role",
    "is_active",
    "disabled_at",
    "disabled_by",
    "created_at",
    "updated_at",
  ] as const;

  const profiles_columns: Record<
    string,
    { exists: boolean; error?: string }
  > = {};

  for (const col of columnProbes) {
    const { error } = await admin.from("profiles").select(col).limit(1);
    profiles_columns[col] = error
      ? { exists: false, error: error.message }
      : { exists: true };
  }

  const { error: tiErr } = await admin
    .from("team_invitations")
    .select("id")
    .limit(1);
  const { error: alErr } = await admin.from("activity_logs").select("id").limit(1);

  return {
    source: "rest_probe",
    note: "Limited without SUPABASE_DB_PASSWORD — column/table existence only",
    profiles_columns,
    team_invitations_exists: !tiErr,
    team_invitations_error: tiErr?.message ?? null,
    activity_logs_exists: !alErr,
    activity_logs_error: alErr?.message ?? null,
    team_role_enum_exists: null,
    public_tables: null,
    enums: null,
  };
}

async function fetchOpenApiTables(url: string, serviceKey: string) {
  const res = await fetch(`${url}/rest/v1/`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/openapi+json",
    },
  });
  const json = (await res.json()) as {
    paths?: Record<string, unknown>;
    definitions?: Record<string, unknown>;
  };
  const fromPaths = Object.keys(json.paths ?? {})
    .map((p) => p.replace(/^\//, ""))
    .filter((p) => p && !p.includes("{"));
  const fromDefs = Object.keys(json.definitions ?? {}).filter(
    (k) => !k.includes("."),
  );
  return [...new Set([...fromPaths, ...fromDefs])].sort();
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const password = process.env.SUPABASE_DB_PASSWORD;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const ref = projectRef(url);
  if (!ref) {
    console.error("Could not parse project ref from URL");
    process.exit(1);
  }

  try {
    if (password) {
      const result = await queryViaPostgres(password, ref);
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    console.error("SUPABASE_DB_PASSWORD not set — falling back to REST column probes");
    const result = await probeViaRest(url, serviceKey);
    const openapiTables = await fetchOpenApiTables(url, serviceKey);
    const { error: superAdminEnumErr } = await createClient(url, serviceKey)
      .from("profiles")
      .select("id")
      .eq("role", "super_admin")
      .limit(1);
    console.log(
      JSON.stringify(
        {
          ...result,
          public_tables_openapi: openapiTables,
          user_role_super_admin_value: superAdminEnumErr
            ? { exists: false, error: superAdminEnumErr.message }
            : { exists: true },
        },
        null,
        2,
      ),
    );
  } catch (err) {
    console.error(
      "Postgres query failed:",
      err instanceof Error ? err.message : err,
    );
    console.error("Falling back to REST column probes");
    const result = await probeViaRest(url, serviceKey);
    console.log(JSON.stringify(result, null, 2));
  }
}

main();
