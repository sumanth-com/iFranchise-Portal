/**
 * Prove root cause of brochure RLS failure and run E2E DB tests.
 *
 * Run: npx tsx scripts/prove-rls-and-e2e.ts
 *
 * Requires .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

const KNOWN_BRAND_ID = "585080b9-4efc-4814-8449-6d8e37d22764";
const KNOWN_USER_ID = "922f4e5a-63b5-4665-b0aa-7775dcef489b";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

type TestResult = { name: string; pass: boolean; detail: string };

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !publishableKey || !serviceKey) {
    console.error("Missing Supabase env vars in .env.local");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const results: TestResult[] = [];

  console.log("\n=================================================");
  console.log("  RLS ROOT CAUSE ANALYSIS + E2E PROOF");
  console.log("=================================================\n");

  // --- 1. Enum check ---
  const { error: enumError } = await admin
    .from("brand_assets")
    .select("id")
    .eq("asset_type", "document")
    .limit(0);

  const enumOk = !enumError?.message?.includes("invalid input value for enum");
  console.log("1. TABLE: public.brand_assets");
  console.log("   CHECK: asset_type enum includes 'document'");
  console.log(`   RESULT: ${enumOk ? "PASS" : "FAIL"}`);
  if (!enumOk) console.log(`   ERROR: ${enumError?.message}`);
  results.push({
    name: "Enum document exists",
    pass: enumOk,
    detail: enumError?.message ?? "OK",
  });

  // --- 2. Known brand state ---
  const { data: brand, error: brandError } = await admin
    .from("brands")
    .select("id, user_id, status, business_name")
    .eq("id", KNOWN_BRAND_ID)
    .maybeSingle();

  console.log("\n2. TABLE: public.brands");
  console.log(`   BRAND: ${KNOWN_BRAND_ID}`);
  if (brand) {
    console.log(`   owner (user_id): ${brand.user_id}`);
    console.log(`   status: ${brand.status}`);
    console.log(`   name: ${brand.business_name}`);
  } else {
    console.log(`   ERROR: ${brandError?.message ?? "not found"}`);
  }

  // --- 3. Create ephemeral test user ---
  const testEmail = `e2e-rls-${Date.now()}@ifranchise-test.local`;
  const testPassword = `E2eTest!${Date.now().toString(36)}`;

  const { data: createdUser, error: createUserError } =
    await admin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

  if (createUserError || !createdUser.user) {
    console.error("\nCannot create test user:", createUserError?.message);
    process.exit(1);
  }

  const testUserId = createdUser.user.id;
  console.log("\n3. TEST USER created:", testEmail);

  // --- 4. Create submitted brand (simulates real user state) ---
  const { data: testBrand, error: createBrandError } = await admin
    .from("brands")
    .insert({
      user_id: testUserId,
      business_name: "E2E RLS Test Brand",
      status: "submitted",
    })
    .select("id")
    .single();

  if (createBrandError || !testBrand) {
    console.error("Cannot create test brand:", createBrandError?.message);
    await admin.auth.admin.deleteUser(testUserId);
    process.exit(1);
  }

  console.log("   TEST BRAND:", testBrand.id, "status=submitted");

  // --- 5. Sign in as test user (authenticated JWT) ---
  const userClient = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: signIn, error: signInError } =
    await userClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

  if (signInError || !signIn.session) {
    console.error("Cannot sign in test user:", signInError?.message);
    process.exit(1);
  }

  const authedClient = createClient(url, publishableKey, {
    global: {
      headers: { Authorization: `Bearer ${signIn.session.access_token}` },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n4. EXACT FAILING QUERY (brochure finalizeBrochureUpload):");
  console.log("   TABLE: public.brand_assets");
  console.log("   OPERATION: INSERT");
  console.log("   POLICY: brand_assets_insert_own_editable");
  console.log("   WITH CHECK: is_brand_owner_editable(brand_id)");

  const insertPayload = {
    brand_id: testBrand.id,
    asset_type: "document" as const,
    storage_path: `${testUserId}/${testBrand.id}/document/e2e-test.pdf`,
    file_name: "e2e-test.pdf",
    mime_type: "application/pdf",
    file_size: 1024,
  };

  console.log("   PAYLOAD:", JSON.stringify(insertPayload, null, 2));

  const { data: insertData, error: insertError } = await authedClient
    .from("brand_assets")
    .insert(insertPayload)
    .select("id")
    .single();

  const insertOk = !insertError && Boolean(insertData?.id);
  console.log(`\n   INSERT RESULT: ${insertOk ? "PASS" : "FAIL"}`);
  if (insertError) {
    console.log(`   EXACT ERROR: ${insertError.message}`);
    console.log(`   CODE: ${insertError.code}`);
    console.log(`   DETAILS: ${insertError.details}`);
    console.log(`   HINT: ${insertError.hint}`);
  }

  results.push({
    name: "Brochure INSERT (document) as owner on submitted brand",
    pass: insertOk,
    detail: insertError?.message ?? `asset id ${insertData?.id}`,
  });

  // --- 6. Logo insert (control) ---
  const logoPayload = {
    brand_id: testBrand.id,
    asset_type: "logo" as const,
    storage_path: `${testUserId}/${testBrand.id}/logo/e2e-test.png`,
    file_name: "e2e-test.png",
    mime_type: "image/png",
    file_size: 512,
  };

  const { error: logoError } = await authedClient
    .from("brand_assets")
    .insert(logoPayload);

  const logoOk = !logoError;
  console.log("\n5. CONTROL: Logo INSERT on same submitted brand");
  console.log(`   RESULT: ${logoOk ? "PASS" : "FAIL"}`);
  if (logoError) console.log(`   ERROR: ${logoError.message}`);

  results.push({
    name: "Logo INSERT as owner on submitted brand",
    pass: logoOk,
    detail: logoError?.message ?? "OK",
  });

  // --- 7. Save draft (brands UPDATE) ---
  const { error: updateError } = await authedClient
    .from("brands")
    .update({ tagline: "E2E test tagline" })
    .eq("id", testBrand.id)
    .eq("user_id", testUserId);

  const updateOk = !updateError;
  console.log("\n6. TABLE: public.brands");
  console.log("   OPERATION: UPDATE (Save Draft)");
  console.log("   POLICY: brands_update_own_editable");
  console.log(`   RESULT: ${updateOk ? "PASS" : "FAIL"}`);
  if (updateError) console.log(`   ERROR: ${updateError.message}`);

  results.push({
    name: "Save Draft UPDATE on submitted brand",
    pass: updateOk,
    detail: updateError?.message ?? "OK",
  });

  // --- Cleanup ---
  await admin.from("brand_assets").delete().eq("brand_id", testBrand.id);
  await admin.from("brands").delete().eq("id", testBrand.id);
  await admin.auth.admin.deleteUser(testUserId);

  // --- Summary ---
  console.log("\n=================================================");
  console.log("  E2E TEST SUMMARY");
  console.log("=================================================\n");

  let allPass = true;
  for (const r of results) {
    console.log(`  [${r.pass ? "PASS" : "FAIL"}] ${r.name}`);
    if (!r.pass) {
      console.log(`         ${r.detail}`);
      allPass = false;
    }
  }

  console.log("\n=================================================");
  if (allPass) {
    console.log("  ALL TESTS PASSED — RLS is correctly configured");
    console.log("=================================================\n");
    process.exit(0);
  }

  console.log("  TESTS FAILED — DATABASE NOT READY");
  console.log("=================================================");
  console.log("\nROOT CAUSE:");
  if (!enumOk) {
    console.log("  • asset_type enum missing 'document'");
  }
  if (!insertOk || !logoOk) {
    console.log(
      "  • is_brand_owner_editable() blocks status='submitted' (migration 001 on live DB)",
    );
    console.log("  • POLICY brand_assets_insert_own_editable → WITH CHECK is_brand_owner_editable(brand_id)");
  }
  if (!updateOk) {
    console.log(
      "  • POLICY brands_update_own_editable hardcodes draft/changes_requested only",
    );
  }
  console.log("\nFIX (run ONCE in Supabase SQL Editor):");
  console.log("  supabase/APPLY_TO_PRODUCTION.sql");
  console.log("\nThen re-run:");
  console.log("  npx tsx scripts/prove-rls-and-e2e.ts");
  console.log("  npx tsx scripts/verify-production-db.ts\n");
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
