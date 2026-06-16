/**
 * Simulates post-auth profile load (same queries as fetchProfileByUserId).
 * Run: npx tsx scripts/trace-profile-load.ts [email] [password]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const EMAIL = process.argv[2] ?? process.env.TEST_LOGIN_EMAIL?.trim();
const PASSWORD = process.argv[3] ?? process.env.TEST_LOGIN_PASSWORD?.trim();

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();
  if (!EMAIL || !PASSWORD) {
    console.error("Usage: npx tsx scripts/trace-profile-load.ts <email> <password>");
    console.error("Or set TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD.");
    process.exit(1);
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const ref = url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

  console.log("project_ref:", ref);
  console.log("email:", EMAIL);

  const userClient = createClient(url, publishable, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const serviceClient = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signIn, error: signInError } =
    await userClient.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });

  console.log("\n=== 1. signInWithPassword ===");
  if (signInError) {
    console.log(JSON.stringify({ ok: false, ...signInError }, null, 2));
    return;
  }
  console.log(
    JSON.stringify(
      {
        ok: true,
        userId: signIn.user?.id,
        session: Boolean(signIn.session),
      },
      null,
      2,
    ),
  );

  const userId = signIn.user!.id;
  const coreFields = "id, email, full_name, role, created_at, updated_at";

  console.log("\n=== 2. fetchProfileByUserId (authenticated user / RLS) ===");
  const userCore = await userClient
    .from("profiles")
    .select(coreFields)
    .eq("id", userId)
    .maybeSingle();
  console.log(
    JSON.stringify(
      {
        data: userCore.data,
        error: userCore.error
          ? {
              message: userCore.error.message,
              code: userCore.error.code,
              details: userCore.error.details,
              hint: userCore.error.hint,
            }
          : null,
      },
      null,
      2,
    ),
  );

  console.log("\n=== 3. fetchProfileByUserId (service role / bypass RLS) ===");
  const serviceCore = await serviceClient
    .from("profiles")
    .select(coreFields)
    .eq("id", userId)
    .maybeSingle();
  console.log(
    JSON.stringify(
      {
        data: serviceCore.data,
        error: serviceCore.error
          ? {
              message: serviceCore.error.message,
              code: serviceCore.error.code,
              details: serviceCore.error.details,
              hint: serviceCore.error.hint,
            }
          : null,
      },
      null,
      2,
    ),
  );

  console.log("\n=== 4. ensure_own_profile RPC (authenticated) ===");
  const rpc = await userClient.rpc("ensure_own_profile");
  console.log(
    JSON.stringify(
      {
        data: rpc.data,
        error: rpc.error
          ? {
              message: rpc.error.message,
              code: rpc.error.code,
              details: rpc.error.details,
              hint: rpc.error.hint,
            }
          : null,
      },
      null,
      2,
    ),
  );
}

main();
