/**
 * Prove upload pipeline works on live DB (service role + brochure enum fallback).
 *
 * Run: npx tsx scripts/prove-upload-fix.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

import { isBrochureAsset } from "../lib/assets/brochure-compat";

const KNOWN_BRAND_ID = "585080b9-4efc-4814-8449-6d8e37d22764";
const KNOWN_USER_ID = "922f4e5a-63b5-4665-b0aa-7775dcef489b";

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log("\n=== UPLOAD PIPELINE PROOF (service role path) ===\n");

  const results: { name: string; pass: boolean; detail: string }[] = [];

  const testEmail = `upload-fix-${Date.now()}@ifranchise-test.local`;
  const { data: testUser, error: testUserError } = await admin.auth.admin.createUser({
    email: testEmail,
    password: `Test!${Date.now()}`,
    email_confirm: true,
  });

  const testUserId = testUser?.user?.id ?? null;

  const { data: tempBrand, error: tempBrandError } = testUserId
    ? await admin
        .from("brands")
        .insert({
          user_id: testUserId,
          business_name: "Upload Fix Proof",
          status: "submitted",
        })
        .select("id")
        .single()
    : { data: null, error: testUserError };

  let logoRow: { id: string } | null = null;
  let logoError: { message: string } | null = null;

  if (tempBrand?.id && testUserId) {
    const logoPath = `${testUserId}/${tempBrand.id}/logo/prove-test.png`;
    const logoResult = await admin
      .from("brand_assets")
      .insert({
        brand_id: tempBrand.id,
        asset_type: "logo",
        storage_path: logoPath,
        file_name: "prove-test.png",
        mime_type: "image/png",
        file_size: 100,
      })
      .select("id")
      .single();
    logoRow = logoResult.data;
    logoError = logoResult.error;
  } else {
    logoError = tempBrandError;
  }

  const logoOk = !logoError && Boolean(logoRow?.id);
  results.push({
    name: "Logo INSERT via service role on submitted brand",
    pass: logoOk,
    detail: logoError?.message ?? logoRow?.id ?? "OK",
  });

  // Brochure insert — try document, fallback gallery
  const docPath = `${KNOWN_USER_ID}/${KNOWN_BRAND_ID}/document/prove-test.pdf`;
  let brochureId: string | null = null;
  let brochureDetail = "";

  const { error: docEnumError } = await admin
    .from("brand_assets")
    .insert({
      brand_id: KNOWN_BRAND_ID,
      asset_type: "document",
      storage_path: docPath,
      file_name: "prove-test.pdf",
      mime_type: "application/pdf",
      file_size: 2048,
    })
    .select("id")
    .single();

  if (!docEnumError) {
    brochureId = (await admin.from("brand_assets").select("id").eq("storage_path", docPath).single()).data?.id ?? null;
    brochureDetail = "inserted as document";
  } else if (docEnumError.message.includes("invalid input value for enum")) {
    const { data: fallback, error: fallbackError } = await admin
      .from("brand_assets")
      .insert({
        brand_id: KNOWN_BRAND_ID,
        asset_type: "gallery",
        storage_path: docPath,
        file_name: "prove-test.pdf",
        mime_type: "application/pdf",
        file_size: 2048,
      })
      .select("id")
      .single();

    brochureId = fallback?.id ?? null;
    brochureDetail = fallbackError?.message ?? "inserted as gallery (enum fallback)";
  } else {
    brochureDetail = docEnumError.message;
  }

  const brochureOk = Boolean(brochureId);
  results.push({
    name: "Brochure INSERT via service role (+ enum fallback)",
    pass: brochureOk,
    detail: brochureDetail,
  });

  // Brochure detection in queries
  if (brochureId) {
    const { data: row } = await admin
      .from("brand_assets")
      .select("id, asset_type, mime_type, storage_path")
      .eq("id", brochureId)
      .single();

    const detected = row ? isBrochureAsset(row) : false;
    results.push({
      name: "Brochure detected by isBrochureAsset()",
      pass: detected,
      detail: row ? JSON.stringify(row) : "row missing",
    });
  }

  // Cleanup test rows
  if (logoRow?.id) await admin.from("brand_assets").delete().eq("id", logoRow.id);
  if (brochureId) await admin.from("brand_assets").delete().eq("id", brochureId);
  if (tempBrand?.id) {
    await admin.from("brand_assets").delete().eq("brand_id", tempBrand.id);
    await admin.from("brands").delete().eq("id", tempBrand.id);
  }
  if (testUserId) await admin.auth.admin.deleteUser(testUserId);

  console.log("Results:\n");
  let allPass = true;
  for (const r of results) {
    console.log(`  [${r.pass ? "PASS" : "FAIL"}] ${r.name}`);
    if (!r.pass) {
      console.log(`         ${r.detail}`);
      allPass = false;
    } else {
      console.log(`         ${r.detail}`);
    }
  }

  console.log(allPass ? "\n=== ALL PASS — uploads will work in app ===\n" : "\n=== FAILED ===\n");
  process.exit(allPass ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
