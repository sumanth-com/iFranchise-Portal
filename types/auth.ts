import type { TeamRole } from "@/types/team";

export type UserRole = "client" | "admin" | "super_admin";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  team_role: TeamRole | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AuthActionState = {
  error: string | null;
  message: string | null;
};

export const initialAuthActionState: AuthActionState = {
  error: null,
  message: null,
};
