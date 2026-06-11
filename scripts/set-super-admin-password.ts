/**
 * One-time bootstrap: set password for an existing super_admin auth user.
 * Does NOT create users, profiles, or send email.
 *
 * Run: npx tsx scripts/set-super-admin-password.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const EMAIL = "sumanth.reddy@ifranchise.in";
const TEMP_PASSWORD = "Sumanth@123";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();

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

  const normalizedEmail = EMAIL.trim().toLowerCase();

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
    console.error(`No profile found for ${EMAIL}`);
    process.exit(1);
  }

  if (profile.role !== "super_admin") {
    console.error(
      `Profile role is "${profile.role}", expected "super_admin". Aborting.`,
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

  const authEmail = authData.user.email?.trim().toLowerCase() ?? "";
  if (authEmail !== normalizedEmail) {
    console.error(
      `Auth email mismatch: profile=${normalizedEmail}, auth=${authEmail}`,
    );
    process.exit(1);
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(
    profile.id,
    {
      password: TEMP_PASSWORD,
      email_confirm: true,
    },
  );

  if (updateError) {
    console.error("Failed to update password:", updateError.message);
    process.exit(1);
  }

  console.log("Password updated successfully.");
  console.log(`  Email:  ${EMAIL}`);
  console.log(`  User:   ${profile.id}`);
  console.log(`  Role:   ${profile.role}`);
  console.log("");
  console.log("Sign in at /login with the temporary password.");
  console.log("Change the password after your first login.");
}

main();
