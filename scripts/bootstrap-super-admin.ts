/**
 * Manual bootstrap: ensure Super Admin profile + role via service role RPC.
 * Does NOT set passwords — use Supabase Auth or set-super-admin-password.ts.
 *
 * Run: npx tsx scripts/bootstrap-super-admin.ts
 */
import { readFileSync } from "fs";
import { resolve } from "path";

function loadEnv() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([^#=]+)=(.*)$/);
      if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    // .env.local optional when vars are already in environment
  }
}

async function main() {
  loadEnv();

  const { runSuperAdminBootstrap, getSuperAdminBootstrapHealth } = await import(
    "../lib/bootstrap/super-admin"
  );

  console.log("Checking bootstrap Super Admin health…");
  const before = await getSuperAdminBootstrapHealth();
  console.log(JSON.stringify(before, null, 2));

  console.log("\nRunning bootstrap repair…");
  const result = await runSuperAdminBootstrap({ source: "cli" });
  console.log(JSON.stringify(result, null, 2));

  if (!result.ok) {
    process.exit(result.skipped ? 0 : 1);
  }
}

main();
