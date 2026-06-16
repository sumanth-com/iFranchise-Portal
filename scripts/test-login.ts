import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

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
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const email = process.env.TEST_LOGIN_EMAIL?.trim();
  const password = process.env.TEST_LOGIN_PASSWORD?.trim();
  if (!email || !password) {
    console.error("Set TEST_LOGIN_EMAIL and TEST_LOGIN_PASSWORD in the environment.");
    process.exit(1);
  }

  console.log("URL:", url);
  console.log("Key prefix:", key.slice(0, 20) + "...");

  const admin = createClient(url, service, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profile } = await admin
    .from("profiles")
    .select("id, email, role, is_active")
    .ilike("email", email)
    .maybeSingle();
  console.log("Profile:", profile);

  if (!profile) return;

  const { data: authUser, error: authErr } =
    await admin.auth.admin.getUserById(profile.id);
  console.log("Auth lookup:", authErr?.message ?? {
    id: authUser.user?.id,
    email: authUser.user?.email,
    confirmed: authUser.user?.email_confirmed_at,
  });

  const anon = createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await anon.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("LOGIN FAILED:", error.message, error.code, error.status);
  } else {
    console.log("LOGIN OK:", data.user?.id, "session:", !!data.session);
  }

  const tokenRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      apikey: key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  const tokenBody = await tokenRes.json();
  console.log("Raw token endpoint:", tokenRes.status, tokenBody.error_description ?? tokenBody.access_token ? "OK" : tokenBody);
}

main();
