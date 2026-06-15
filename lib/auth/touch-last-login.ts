import type { SupabaseClient } from "@supabase/supabase-js";

export async function touchLastLogin(
  userId: string,
  supabase: SupabaseClient,
): Promise<void> {
  await supabase
    .from("profiles")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", userId)
    .in("role", ["admin", "super_admin"]);
}
