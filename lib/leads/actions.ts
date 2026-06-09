"use server";

import { revalidatePath } from "next/cache";

import { requireAdmin, requireClient } from "@/lib/auth/session";
import { createClient } from "@/lib/supabase/server";
import type { LeadActionState, LeadStatus } from "@/types/lead";

function parseField(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

export async function submitLeadInquiry(
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const brandId = parseField(formData, "brandId");
  const name = parseField(formData, "name");
  const email = parseField(formData, "email");
  const phone = parseField(formData, "phone") || null;
  const city = parseField(formData, "city") || null;
  const message = parseField(formData, "message") || null;

  if (!brandId) return { error: "Brand not found.", message: null };
  if (!name) return { error: "Name is required.", message: null };
  if (!email || !email.includes("@")) {
    return { error: "A valid email is required.", message: null };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leads").insert({
    brand_id: brandId,
    name,
    email,
    phone,
    city,
    message,
    source: "marketplace",
    status: "new",
  });

  if (error) {
    if (error.message.includes("leads") && error.message.includes("schema")) {
      return {
        error: "Lead capture is not configured yet. Please contact support.",
        message: null,
      };
    }
    return {
      error: "Unable to submit inquiry. Please try again.",
      message: null,
    };
  }

  return {
    error: null,
    message: "Thank you! Your inquiry has been sent to the brand team.",
  };
}

export async function updateLeadStatus(
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  await requireAdmin();
  const leadId = parseField(formData, "leadId");
  const status = parseField(formData, "status") as LeadStatus;

  if (!leadId) return { error: "Lead ID missing.", message: null };

  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) {
    return { error: "Failed to update lead status.", message: null };
  }

  revalidatePath("/admin/leads");
  revalidatePath("/dashboard/leads");
  return { error: null, message: "Lead status updated." };
}

export async function updateOwnerLeadStatus(
  _prev: LeadActionState,
  formData: FormData,
): Promise<LeadActionState> {
  const profile = await requireClient();
  const leadId = parseField(formData, "leadId");
  const status = parseField(formData, "status") as LeadStatus;

  if (!leadId) return { error: "Lead ID missing.", message: null };

  const supabase = await createClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("id, brand_id, brands!inner(user_id)")
    .eq("id", leadId)
    .maybeSingle();

  const brand = lead?.brands as { user_id: string } | { user_id: string }[] | null;
  const ownerId = Array.isArray(brand) ? brand[0]?.user_id : brand?.user_id;

  if (!lead || ownerId !== profile.id) {
    return { error: "Lead not found.", message: null };
  }

  const { error } = await supabase
    .from("leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId);

  if (error) {
    return { error: "Failed to update lead status.", message: null };
  }

  revalidatePath("/dashboard/leads");
  return { error: null, message: "Lead status updated." };
}
