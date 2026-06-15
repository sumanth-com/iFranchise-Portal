import { formatRelativeTime } from "@/lib/format-date";
import type { TeamDirectoryMember, TeamDirectoryStats } from "@/types/team-directory";
import type { TeamMember } from "@/types/team";
import { TEAM_ROLE_LABELS } from "@/types/team";

const ROLE_TO_DESIGNATION: Partial<Record<string, string>> = {
  super_admin: "Super Admin",
  admin: "Admin",
  reviewer: "Franchise Consultant",
  content_manager: "Content Manager",
  support: "Support Executive",
};

const ROLE_TO_DEPARTMENT: Partial<Record<string, string>> = {
  super_admin: "C Suite",
  admin: "Operations",
  reviewer: "Franchise Consulting",
  content_manager: "Content",
  support: "Support",
};

/** iFranchise team roster — merged with Supabase when accounts exist. */
export const IFRANCHISE_TEAM_ROSTER: TeamDirectoryMember[] = [
  {
    id: "team-abdul",
    full_name: "Syed Abdul Khader",
    email: "abdul@ifranchise.in",
    phone: "+919247536516",
    role: "Founder & Director",
    department: "C Suite",
    gender: "Male",
    birthday: "9th August",
    status: "active",
    joined_at: "2024-01-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: [
      "Company vision & strategy",
      "Executive leadership",
      "Key partnerships",
    ],
    team_role: "super_admin",
    source: "dummy",
  },
  {
    id: "team-abrar",
    full_name: "Mohammad Abrar",
    email: "abrar@ifranchise.in",
    phone: "+919247536526",
    role: "Cofounder",
    department: "C Suite",
    gender: "Male",
    birthday: "29th September",
    status: "active",
    joined_at: "2024-01-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: [
      "Co-founder operations",
      "Growth initiatives",
      "Platform direction",
    ],
    team_role: "super_admin",
    source: "dummy",
  },
  {
    id: "team-himani",
    full_name: "Himani Bhargava Tapadiya",
    email: "himani.bhargava@ifranchise.in",
    phone: "+919711763264",
    role: "Business Development Associate",
    department: "Sales/Business Development",
    gender: "Female",
    birthday: "7th June",
    status: "active",
    joined_at: "2024-06-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    profile_image: "/assets/Himani.webp",
    profile_image_position: "center 12%",
    responsibilities: [
      "Lead generation",
      "Partnership outreach",
      "Sales pipeline",
    ],
    source: "dummy",
  },
  {
    id: "team-om",
    full_name: "Om Anil Ramtekkar",
    email: "om.ramtekkar@ifranchise.in",
    phone: "+918600357983",
    role: "Business Development Associate",
    department: "Sales/Business Development",
    gender: "Male",
    birthday: "13th March",
    status: "active",
    joined_at: "2024-07-15T00:00:00Z",
    last_active_at: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    profile_image: "/assets/Om.webp",
    profile_image_position: "center 10%",
    responsibilities: [
      "Business development",
      "Client acquisition",
      "Market research",
    ],
    source: "dummy",
  },
  {
    id: "team-ekta",
    full_name: "Ekta Pattanaik",
    email: "ekta@ifranchise.in",
    phone: "+919247536532",
    role: "HR & Operations Executive",
    department: "Human Resource",
    gender: "Female",
    birthday: "12th April",
    status: "active",
    joined_at: "2024-05-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 6 * 3_600_000).toISOString(),
    profile_image: "/assets/Ekta.webp",
    profile_image_position: "center top",
    responsibilities: [
      "HR operations",
      "Team onboarding",
      "Internal processes",
    ],
    source: "dummy",
  },
  {
    id: "team-fazil",
    full_name: "Mohammed Fazil Arfath",
    email: "fazil.arfath@ifranchise.in",
    phone: "+919066249066",
    role: "Digital Marketing Specialist",
    department: "Marketing",
    gender: "Male",
    birthday: "17th June",
    status: "active",
    joined_at: "2024-08-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 8 * 3_600_000).toISOString(),
    profile_image: "/assets/Fazil.webp",
    profile_image_position: "center 8%",
    responsibilities: [
      "Digital campaigns",
      "Social media",
      "Brand marketing",
    ],
    source: "dummy",
  },
  {
    id: "team-sumanth",
    full_name: "Gangaram Sumanth Reddy",
    email: "sumanth.reddy@ifranchise.in",
    phone: "+918074241025",
    role: "Website Developer Intern",
    department: "Marketing",
    gender: "Male",
    birthday: "15th April",
    status: "active",
    joined_at: "2024-06-03T00:00:00Z",
    last_active_at: new Date(Date.now() - 1 * 3_600_000).toISOString(),
    profile_image: "/assets/Sumanth.png",
    profile_image_position: "center top",
    responsibilities: [
      "Portal development",
      "UI implementation",
      "Platform maintenance",
    ],
    team_role: "super_admin",
    source: "dummy",
  },
];

const ROSTER_BY_EMAIL = new Map(
  IFRANCHISE_TEAM_ROSTER.map((member) => [member.email.toLowerCase(), member]),
);

/** @deprecated Use IFRANCHISE_TEAM_ROSTER */
export const DUMMY_TEAM_MEMBERS = IFRANCHISE_TEAM_ROSTER;

export function mapTeamMemberToDirectory(member: TeamMember): TeamDirectoryMember {
  const roster = ROSTER_BY_EMAIL.get(member.email.toLowerCase());
  if (roster) {
    return {
      ...roster,
      id: member.id,
      source: "supabase",
      team_role: member.team_role,
      status: member.is_active ? "active" : "inactive",
      joined_at: member.created_at,
      last_active_at: member.updated_at,
    };
  }

  const designation =
    ROLE_TO_DESIGNATION[member.team_role] ?? TEAM_ROLE_LABELS[member.team_role];
  return {
    id: member.id,
    full_name: member.full_name ?? member.email,
    email: member.email,
    phone: "—",
    role: designation,
    department: ROLE_TO_DEPARTMENT[member.team_role] ?? "Operations",
    status: member.is_active ? "active" : "inactive",
    joined_at: member.created_at,
    last_active_at: member.updated_at,
    profile_image: null,
    responsibilities: [`${TEAM_ROLE_LABELS[member.team_role]} portal access`],
    team_role: member.team_role,
    source: "supabase",
  };
}

export function mergeTeamDirectory(
  supabaseMembers: TeamMember[],
): TeamDirectoryMember[] {
  const supabaseEmails = new Set(
    supabaseMembers.map((member) => member.email.toLowerCase()),
  );

  const fromSupabase = supabaseMembers.map(mapTeamMemberToDirectory);
  const rosterOnly = IFRANCHISE_TEAM_ROSTER.filter(
    (member) => !supabaseEmails.has(member.email.toLowerCase()),
  );

  return [...fromSupabase, ...rosterOnly].sort((a, b) => {
    const deptOrder = (d: string) => {
      if (d === "C Suite") return 0;
      return 1;
    };
    const deptDiff = deptOrder(a.department) - deptOrder(b.department);
    if (deptDiff !== 0) return deptDiff;
    return a.full_name.localeCompare(b.full_name);
  });
}

export function computeTeamStats(members: TeamDirectoryMember[]): TeamDirectoryStats {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  return {
    total: members.length,
    active: members.filter((m) => m.status === "active").length,
    inactive: members.filter((m) => m.status === "inactive").length,
    newThisMonth: members.filter(
      (m) => new Date(m.joined_at) >= monthStart,
    ).length,
  };
}

export function filterTeamMembers(
  members: TeamDirectoryMember[],
  filters: {
    query: string;
    emailQuery: string;
    department: string;
    status: string;
    role: string;
  },
): TeamDirectoryMember[] {
  const nameQ = filters.query.trim().toLowerCase();
  const emailQ = filters.emailQuery.trim().toLowerCase();

  return members.filter((m) => {
    if (nameQ && !m.full_name.toLowerCase().includes(nameQ)) return false;
    if (emailQ && !m.email.toLowerCase().includes(emailQ)) return false;
    if (
      filters.department &&
      filters.department !== "All Departments" &&
      m.department !== filters.department
    )
      return false;
    if (filters.status && filters.status !== "all" && m.status !== filters.status)
      return false;
    if (filters.role && filters.role !== "all" && m.role !== filters.role)
      return false;
    return true;
  });
}

export function formatLastActive(value: string | null): string {
  if (!value) return "Never";
  return formatRelativeTime(value) ?? "Recently";
}

export function avatarGradient(name: string): string {
  const hues = [262, 230, 200, 170, 320, 280];
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hues[hash % hues.length];
  return `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 40) % 360} 65% 45%))`;
}
