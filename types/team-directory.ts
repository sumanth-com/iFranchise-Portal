import type { TeamRole } from "@/types/team";

export type TeamMemberStatus = "active" | "inactive";

/** Directory card model — ready for Supabase profiles + team extensions. */
export type TeamDirectoryMember = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  /** Display designation (e.g. Operations Manager). */
  role: string;
  department: string;
  status: TeamMemberStatus;
  joined_at: string;
  last_active_at: string | null;
  profile_image: string | null;
  responsibilities: string[];
  /** Portal team_role when synced from Supabase. */
  team_role?: TeamRole;
  source: "dummy" | "supabase";
};

export type TeamDirectoryStats = {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
};

export type TeamDirectoryFilters = {
  query: string;
  emailQuery: string;
  department: string;
  status: string;
  role: string;
};

export const TEAM_DEPARTMENTS = [
  "All Departments",
  "Operations",
  "Franchise Consulting",
  "Brand Success",
  "Sales & CRM",
  "Marketing",
  "Content",
  "Finance",
  "Partnerships",
  "Growth",
  "Support",
] as const;

export const TEAM_DESIGNATIONS = [
  "Operations Manager",
  "Franchise Consultant",
  "Brand Success Manager",
  "Lead Manager",
  "Business Analyst",
  "Marketing Manager",
  "CRM Executive",
  "Sales Manager",
  "Support Executive",
  "Content Manager",
  "Finance Executive",
  "Partnership Manager",
  "Territory Manager",
  "Growth Manager",
] as const;
