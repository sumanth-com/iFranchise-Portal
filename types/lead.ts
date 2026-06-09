export type LeadStatus = "new" | "contacted" | "qualified" | "closed";

export type Lead = {
  id: string;
  brand_id: string;
  name: string;
  email: string;
  phone: string | null;
  city: string | null;
  message: string | null;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
};

export type LeadWithBrand = Lead & {
  brand_name: string;
  owner_email?: string;
};

export type LeadActionState = {
  error: string | null;
  message: string | null;
};

export const initialLeadActionState: LeadActionState = {
  error: null,
  message: null,
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  contacted: "Contacted",
  qualified: "Qualified",
  closed: "Closed",
};
