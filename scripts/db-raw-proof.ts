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

function projectRef(url: string): string | null {
  return url.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? null;
}

async function listAllAuthUsers(
  admin: ReturnType<typeof createClient>,
): Promise<{ id: string; email: string | undefined }[]> {
  const users: { id: string; email: string | undefined }[] = [];
  let page = 1;
  const perPage = 1000;
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw new Error(`auth.users: ${error.message}`);
    for (const u of data.users) {
      users.push({ id: u.id, email: u.email });
    }
    if (data.users.length < perPage) break;
    page += 1;
  }
  return users;
}

async function main() {
  loadEnv();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  const ref = projectRef(url);

  console.log("NEXT_PUBLIC_SUPABASE_URL=");
  console.log(url);
  console.log("");
  console.log("project_ref=");
  console.log(ref ?? "");
  console.log("");

  const admin = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const authUsers = await listAllAuthUsers(admin);
  console.log("auth.users emails=");
  console.log(JSON.stringify(authUsers, null, 2));
  console.log("");

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, email, role, team_role, is_active")
    .order("email");

  if (profilesError) {
    throw new Error(`public.profiles: ${profilesError.message}`);
  }

  console.log("public.profiles=");
  console.log(JSON.stringify(profiles, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
