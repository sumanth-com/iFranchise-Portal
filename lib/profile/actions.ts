"use server";

import { revalidatePath } from "next/cache";

import { requireClient } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";

import type { ProfileActionState } from "./types";

export async function updateProfileAction(
  _prev: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const profile = await requireClient();
  const fullName = String(
    formData.get("fullName") ?? formData.get("full_name") ?? "",
  ).trim();

  if (!fullName) {
    return { error: "Name is required.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ full_name: fullName })
    .eq("id", profile.id);

  if (error) {
    return {
      error: error.message || "Failed to save profile.",
      message: null,
    };
  }

  revalidatePath("/dashboard", "layout");

  return { error: null, message: "Profile saved successfully." };
}
