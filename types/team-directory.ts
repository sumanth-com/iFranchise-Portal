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
  gender?: string | null;
  birthday?: string | null;
  status: TeamMemberStatus;
  joined_at: string;
  last_active_at: string | null;
  profile_image: string | null;
  /** Fine-tune photo crop inside the avatar frame. */
  profile_image_position?: string | null;
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
  "C Suite",
  "Sales/Business Development",
  "Human Resource",
  "Marketing",
] as const;

export const TEAM_DESIGNATIONS = [
  "Founder & Director",
  "Cofounder",
  "Business Development Associate",
  "HR & Operations Executive",
  "Website Developer Intern",
  "Digital Marketing Specialist",
] as const;
