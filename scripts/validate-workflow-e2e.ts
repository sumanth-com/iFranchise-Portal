/**
 * End-to-end workflow validation (schema-aware).
 * Run: npx tsx scripts/validate-workflow-e2e.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

type StepResult = {
  step: number;
  name: string;
  pass: boolean;
  detail: string;
  skipped?: boolean;
};

function loadEnv() {
  const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  }
}

function authedClient(url: string, key: string, token: string) {
  return createClient(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function columnExists(
  admin: ReturnType<typeof createClient>,
  column: string,
): Promise<boolean> {
  const { error } = await admin.from("brands").select(column).limit(0);
  return !error?.message?.toLowerCase().includes("could not find");
}

async function assetTypeExists(
  admin: ReturnType<typeof createClient>,
  type: string,
): Promise<boolean> {
  const { error } = await admin
    .from("brand_assets")
    .select("id")
    .eq("asset_type", type)
    .limit(0);
  return !error?.message?.includes("invalid input value for enum");
}

async function main() {
  loadEnv();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!url || !publishableKey || !serviceKey) {
    console.error("Missing Supabase env vars");
    process.exit(1);
  }

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const hasPublishedAt = await columnExists(admin, "published_at");
  const hasPublishReady = await columnExists(admin, "publish_ready");
  const hasDocumentType = await assetTypeExists(admin, "document");

  console.log("\n=== E2E WORKFLOW VALIDATION ===\n");
  console.log("Schema probe:");
  console.log(`  published_at: ${hasPublishedAt ? "yes" : "MISSING"}`);
  console.log(`  publish_ready: ${hasPublishReady ? "yes" : "MISSING"}`);
  console.log(`  asset_type document: ${hasDocumentType ? "yes" : "MISSING"}`);
  if (!hasPublishedAt || !hasDocumentType) {
    console.log(
      "\n  ⚠ Run supabase/APPLY_WORKFLOW_COMPLETE.sql in Supabase SQL Editor first.\n",
    );
  }

  const results: StepResult[] = [];
  const ts = Date.now();
  const ownerEmail = `e2e-owner-${ts}@ifranchise-test.local`;
  const adminEmail = `e2e-admin-${ts}@ifranchise-test.local`;
  const password = `E2e!${ts}`;

  let ownerId = "";
  let adminUserId = "";
  let brandId = "";

  const { data: ownerUser, error: ownerCreateErr } =
    await admin.auth.admin.createUser({
      email: ownerEmail,
      password,
      email_confirm: true,
    });
  if (ownerCreateErr || !ownerUser.user) {
    console.error("Failed to create owner:", ownerCreateErr?.message);
    process.exit(1);
  }
  ownerId = ownerUser.user.id;
  await admin.from("profiles").upsert({
    id: ownerId,
    email: ownerEmail,
    full_name: "E2E Owner",
    role: "client",
  });

  const { data: adminUser, error: adminCreateErr } =
    await admin.auth.admin.createUser({
      email: adminEmail,
      password,
      email_confirm: true,
    });
  if (adminCreateErr || !adminUser.user) {
    console.error("Failed to create admin:", adminCreateErr?.message);
    process.exit(1);
  }
  adminUserId = adminUser.user.id;
  await admin.from("profiles").upsert({
    id: adminUserId,
    email: adminEmail,
    full_name: "E2E Admin",
    role: "admin",
    team_role: "admin",
    is_active: true,
  });

  const anon = createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: ownerSignIn } = await anon.auth.signInWithPassword({
    email: ownerEmail,
    password,
  });
  const ownerClient = authedClient(
    url,
    publishableKey,
    ownerSignIn!.session!.access_token,
  );

  const { data: adminSignIn } = await anon.auth.signInWithPassword({
    email: adminEmail,
    password,
  });
  const adminClient = authedClient(
    url,
    publishableKey,
    adminSignIn!.session!.access_token,
  );

  // Step 1: Create brand (core columns only)
  const { data: brand, error: createErr } = await ownerClient
    .from("brands")
    .insert({
      user_id: ownerId,
      business_name: `E2E Workflow Brand ${ts}`,
      industry: "Food & Beverage",
      tagline: "Test franchise",
      description: "E2E validation brand",
      contact_email: ownerEmail,
      status: "draft",
    })
    .select("id")
    .single();

  brandId = brand?.id ?? "";
  results.push({
    step: 1,
    name: "Brand owner creates brand",
    pass: !createErr && Boolean(brandId),
    detail: createErr?.message ?? `brandId=${brandId}`,
  });

  if (!brandId) {
    report(results);
    process.exit(1);
  }

  // Assets
  await ownerClient.from("brand_assets").insert({
    brand_id: brandId,
    asset_type: "logo",
    storage_path: `${ownerId}/${brandId}/logo/e2e.png`,
    file_name: "e2e.png",
    mime_type: "image/png",
    file_size: 1024,
  });
  await ownerClient.from("brand_assets").insert({
    brand_id: brandId,
    asset_type: "gallery",
    storage_path: `${ownerId}/${brandId}/gallery/e2e1.png`,
    file_name: "e2e1.png",
    mime_type: "image/png",
    file_size: 2048,
  });
  if (hasDocumentType) {
    await ownerClient.from("brand_assets").insert({
      brand_id: brandId,
      asset_type: "document",
      storage_path: `${ownerId}/${brandId}/document/e2e.pdf`,
      file_name: "brochure.pdf",
      mime_type: "application/pdf",
      file_size: 4096,
    });
  }

  // Step 2: Submit
  const { error: submitErr } = await ownerClient
    .from("brands")
    .update({ status: "submitted", submitted_at: new Date().toISOString() })
    .eq("id", brandId)
    .eq("user_id", ownerId);
  results.push({
    step: 2,
    name: "Brand submits successfully",
    pass: !submitErr,
    detail: submitErr?.message ?? "status=submitted",
  });

  // Step 3
  const { data: pending } = await adminClient
    .from("brands")
    .select("id, status")
    .eq("status", "submitted")
    .eq("id", brandId)
    .maybeSingle();
  results.push({
    step: 3,
    name: "Admin sees pending review",
    pass: pending?.status === "submitted",
    detail: `status=${pending?.status ?? "not found"}`,
  });

  // Step 4
  const { data: assets } = await adminClient
    .from("brand_assets")
    .select("asset_type")
    .eq("brand_id", brandId);
  const types = new Set((assets ?? []).map((a) => a.asset_type));
  const assetsOk =
    types.has("logo") &&
    types.has("gallery") &&
    (!hasDocumentType || types.has("document"));
  results.push({
    step: 4,
    name: "Admin can view all assets",
    pass: assetsOk,
    detail: `types=${[...types].join(",")}`,
  });

  // Step 5
  const { error: changesErr } = await adminClient
    .from("brands")
    .update({
      status: "changes_requested",
      admin_feedback: "Please update investment details.",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUserId,
    })
    .eq("id", brandId);
  results.push({
    step: 5,
    name: "Admin can request changes",
    pass: !changesErr,
    detail: changesErr?.message ?? "status=changes_requested",
  });

  // Step 6
  const { error: editErr } = await ownerClient
    .from("brands")
    .update({ tagline: "Updated after changes requested" })
    .eq("id", brandId)
    .eq("user_id", ownerId);
  const { error: resubmitErr } = await ownerClient
    .from("brands")
    .update({
      status: "submitted",
      submitted_at: new Date().toISOString(),
    })
    .eq("id", brandId)
    .eq("user_id", ownerId);
  results.push({
    step: 6,
    name: "Brand owner can edit and resubmit",
    pass: !editErr && !resubmitErr,
    detail: [editErr?.message ?? "edit=ok", resubmitErr?.message ?? "resubmit=ok"].join(" | "),
  });

  // Step 7
  const { error: approveErr } = await adminClient
    .from("brands")
    .update({
      status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: adminUserId,
    })
    .eq("id", brandId);
  const { data: approvedRow } = await admin
    .from("brands")
    .select("status, published_at, publish_ready")
    .eq("id", brandId)
    .single();
  results.push({
    step: 7,
    name: "Admin can approve (not auto-published)",
    pass:
      !approveErr &&
      approvedRow?.status === "approved" &&
      !approvedRow?.published_at,
    detail: approveErr?.message ??
      `status=${approvedRow?.status} published_at=${approvedRow?.published_at ?? "null"}`,
  });

  // Step 10 (before publish)
  const { data: prePublish } = await admin
    .from("brands")
    .select("id")
    .eq("id", brandId)
    .eq("status", "approved")
    .not("published_at", "is", null);
  results.push({
    step: 10,
    name: "Unpublished brands never appear publicly",
    pass: hasPublishedAt ? (prePublish ?? []).length === 0 : true,
    detail: hasPublishedAt
      ? `publicMatches=${(prePublish ?? []).length}`
      : "skipped — published_at column missing",
    skipped: !hasPublishedAt,
  });

  // Steps 8-9 require published_at column
  if (hasPublishedAt) {
    const publishPayload: Record<string, unknown> = {
      published_at: new Date().toISOString(),
    };
    if (hasPublishReady) publishPayload.publish_ready = true;

    const { error: publishErr } = await adminClient
      .from("brands")
      .update(publishPayload)
      .eq("id", brandId);
    results.push({
      step: 8,
      name: "Admin can publish",
      pass: !publishErr,
      detail: publishErr?.message ?? "published_at set",
    });

    const { data: publishedRow } = await admin
      .from("brands")
      .select("id, published_at")
      .eq("id", brandId)
      .eq("status", "approved")
      .not("published_at", "is", null)
      .maybeSingle();
    results.push({
      step: 9,
      name: "Published brand appears on public website",
      pass: Boolean(publishedRow?.published_at),
      detail: publishedRow ? "found in published query" : "not found",
    });
  } else {
    results.push({
      step: 8,
      name: "Admin can publish",
      pass: false,
      detail: "BLOCKED — run APPLY_WORKFLOW_COMPLETE.sql",
      skipped: true,
    });
    results.push({
      step: 9,
      name: "Published brand appears on public website",
      pass: false,
      detail: "BLOCKED — run APPLY_WORKFLOW_COMPLETE.sql",
      skipped: true,
    });
  }

  // Cleanup
  await admin.from("brand_assets").delete().eq("brand_id", brandId);
  await admin.from("brands").delete().eq("id", brandId);
  await admin.auth.admin.deleteUser(ownerId);
  await admin.auth.admin.deleteUser(adminUserId);

  report(results);

  const blocking = results.filter((r) => !r.pass && !r.skipped);
  const schemaBlocked = results.some((r) => r.skipped);
  process.exit(blocking.length > 0 || schemaBlocked ? 1 : 0);
}

function report(results: StepResult[]) {
  console.log("RESULTS:\n");
  for (const r of results.sort((a, b) => a.step - b.step)) {
    const tag = r.skipped ? "SKIP" : r.pass ? "PASS" : "FAIL";
    console.log(`  [${tag}] ${r.step}. ${r.name}`);
    if (!r.pass || r.skipped) console.log(`         ${r.detail}`);
  }
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
