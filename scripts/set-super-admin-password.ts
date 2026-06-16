/**
 * Optional CLI: set password for an existing bootstrap Super Admin auth user.
 * Password is read from SUPER_ADMIN_PASSWORD env var only — never hardcoded.
 *
 * Run:
 *   SUPER_ADMIN_PASSWORD='your-secure-password' npx tsx scripts/set-super-admin-password.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

import { BOOTSTRAP_SUPER_ADMIN_EMAIL } from "../lib/bootstrap/types";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();

  const password = process.env.SUPER_ADMIN_PASSWORD?.trim();
  if (!password) {
    console.error(
      "Set SUPER_ADMIN_PASSWORD in your shell before running this script.",
    );
    console.error(
      "Example: SUPER_ADMIN_PASSWORD='your-password' npx tsx scripts/set-super-admin-password.ts",
    );
    console.error("");
    console.error(
      "Prefer Supabase Dashboard → Authentication → Users → Send password reset.",
    );
    process.exit(1);
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const normalizedEmail = BOOTSTRAP_SUPER_ADMIN_EMAIL.trim().toLowerCase();

  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("id, email, role, team_role")
    .ilike("email", normalizedEmail)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile:", profileError.message);
    process.exit(1);
  }

  if (!profile) {
    console.error(`No profile found for ${BOOTSTRAP_SUPER_ADMIN_EMAIL}`);
    console.error("Run: npx tsx scripts/bootstrap-super-admin.ts");
    process.exit(1);
  }

  if (profile.role !== "super_admin") {
    console.error(
      `Profile role is "${profile.role}", expected "super_admin". Run bootstrap repair first.`,
    );
    process.exit(1);
  }

  const { data: authData, error: authLookupError } =
    await admin.auth.admin.getUserById(profile.id);

  if (authLookupError || !authData.user) {
    console.error(
      "Auth user not found for profile id:",
      profile.id,
      authLookupError?.message ?? "",
    );
    process.exit(1);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id,
    {
      password,
      email_confirm: true,
    },
  );

  if (updateError) {
    console.error("Failed to update password:", updateError.message);
    process.exit(1);
  }

  console.log("Password updated via Supabase Auth.");
  console.log(`  Email: ${BOOTSTRAP_SUPER_ADMIN_EMAIL}`);
  console.log(`  User:  ${profile.id}`);
  console.log("Sign in at /login. Use password reset for future changes.");
}

main();
