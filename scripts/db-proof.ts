/**
 * Live database connection proof.
 * Run: npx tsx scripts/db-proof.ts
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

function jwtRef(token: string): string | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof json.ref === "string" ? json.ref : null;
  } catch {
    return null;
  }
}

async function runSqlQueries(password: string, ref: string) {
  const hosts = [
    `db.${ref}.supabase.co`,
    `aws-0-ap-south-1.pooler.supabase.com`,
    `aws-0-us-east-1.pooler.supabase.com`,
    `aws-0-eu-west-1.pooler.supabase.com`,
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
      connectionTimeoutMillis: 15000,
    });

    try {
      await client.connect();

      const currentDb = await client.query("SELECT current_database();");
      const authCount = await client.query("SELECT count(*) FROM auth.users;");
      const profilesCount = await client.query(
        "SELECT count(*) FROM public.profiles;",
      );

      await client.end();

      return {
        connected_host: host,
        queries: {
          "SELECT current_database();": currentDb.rows,
          "SELECT count(*) FROM auth.users;": authCount.rows,
          "SELECT count(*) FROM public.profiles;": profilesCount.rows,
        },
      };
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

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const dbPassword = process.env.SUPABASE_DB_PASSWORD ?? "";
  const ref = projectRef(url);

  const envFile = resolve(process.cwd(), ".env.local");
  const nodeEnv = process.env.NODE_ENV ?? "(unset)";
  const isHostedSupabase = /\.supabase\.co/.test(url);
  const isLocalSupabase =
    /localhost|127\.0\.0\.1/.test(url) || ref === "local";

  let environment: string;
  if (isLocalSupabase) {
    environment = "local";
  } else if (isHostedSupabase) {
    environment =
      nodeEnv === "production"
        ? "production (app runtime)"
        : "dev (local app → remote Supabase project)";
  } else {
    environment = "unknown";
  }

  console.log("=== CONNECTION TARGET (from .env.local) ===");
  console.log(`env_file: ${envFile}`);
  console.log(`supabase_project_url: ${url}`);
  console.log(`supabase_project_ref: ${ref ?? "(unparsed)"}`);
  console.log(`service_role_jwt_ref: ${jwtRef(serviceKey) ?? "(undecodable)"}`);
  console.log(`database_name_expected: postgres`);
  console.log(`environment: ${environment}`);
  console.log(`node_env: ${nodeEnv}`);
  console.log(
    `service_role_key_present: ${serviceKey ? "yes" : "no"} (prefix: ${serviceKey.slice(0, 12)}...)`,
  );
  console.log(`supabase_db_password_present: ${dbPassword ? "yes" : "no"}`);
  console.log("");

  if (!url || !ref) {
    console.error("Missing or invalid NEXT_PUBLIC_SUPABASE_URL");
    process.exit(1);
  }

  if (dbPassword) {
    console.log("=== SQL QUERY RESULTS (direct Postgres) ===");
    try {
      const result = await runSqlQueries(dbPassword, ref);
      console.log(`connected_host: ${result.connected_host}`);
      for (const [sql, rows] of Object.entries(result.queries)) {
        console.log(`\n-- ${sql}`);
        console.log(JSON.stringify(rows, null, 2));
      }
      return;
    } catch (err) {
      console.error(
        "Postgres connection failed:",
        err instanceof Error ? err.message : err,
      );
      process.exit(1);
    }
  }

  console.log("=== SQL QUERY RESULTS ===");
  console.log(
    "SUPABASE_DB_PASSWORD is not set in .env.local — cannot run direct SQL.",
  );
  console.log(
    "Showing equivalent live counts via Supabase service-role API (same project):",
  );
  console.log("");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  // auth.users count via Admin Auth API
  let authTotal = 0;
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage,
    });
    if (error) {
      console.error("auth.users count failed:", error.message);
      process.exit(1);
    }
    authTotal += data.users.length;
    if (data.users.length < perPage) break;
    page += 1;
  }

  const { count: profilesCount, error: profilesError } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true });

  if (profilesError) {
    console.error("public.profiles count failed:", profilesError.message);
    process.exit(1);
  }

  console.log("-- SELECT current_database();");
  console.log(
    JSON.stringify(
      [{ error: "requires SUPABASE_DB_PASSWORD for direct Postgres SQL" }],
      null,
      2,
    ),
  );
  console.log("\n-- SELECT count(*) FROM auth.users;");
  console.log(JSON.stringify([{ count: authTotal }], null, 2));
  console.log("\n-- SELECT count(*) FROM public.profiles;");
  console.log(JSON.stringify([{ count: profilesCount }], null, 2));
}

main();
