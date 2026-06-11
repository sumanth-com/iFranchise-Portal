/**
 * Replays callback profile path with a live session (same queries as callback route).
 * Run: npx tsx scripts/replay-callback-profile.ts [email] [password]
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

import { ensureProfileForUser } from "../lib/auth/ensure-profile";
import { fetchProfileByUserId } from "../lib/auth/fetch-profile";

const EMAIL = process.argv[2] ?? "sumanth.reddy@ifranchise.in";
const PASSWORD = process.argv[3] ?? "Sumanth@123";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function dumpError(label: string, error: unknown) {
  console.error(`\n=== ${label} ===`);
  if (error && typeof error === "object") {
    console.error(JSON.stringify(error, null, 2));
    if (error instanceof Error && error.stack) {
      console.error("stack:", error.stack);
    }
  } else {
    console.error(String(error));
  }
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishable = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

  const supabase = createClient(url, publishable, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signIn, error: signInError } =
    await supabase.auth.signInWithPassword({ email: EMAIL, password: PASSWORD });

  if (signInError) {
    dumpError("signInWithPassword", signInError);
    process.exit(1);
  }

  const user = signIn.user!;
  console.log("session user:", { id: user.id, email: user.email });

  console.log("\n--- fetchProfileByUserId (callback uses this first) ---");
  try {
    const fetched = await fetchProfileByUserId(supabase, user.id);
    console.log("result:", JSON.stringify(fetched, null, 2));
  } catch (error) {
    dumpError("fetchProfileByUserId THREW", error);
  }

  console.log("\n--- ensureProfileForUser (callback route.ts line 62) ---");
  try {
    const profile = await ensureProfileForUser(user, supabase);
    console.log("profile:", profile ? JSON.stringify(profile, null, 2) : null);
    if (!profile) {
      console.error("ensureProfileForUser returned null (no exception thrown)");
    }
  } catch (error) {
    dumpError("ensureProfileForUser THREW", error);
  }
}

main().catch((error) => {
  dumpError("FATAL", error);
  process.exit(1);
});
