import { formatRelativeTime } from "@/lib/format-date";
import type { TeamDirectoryMember, TeamDirectoryStats } from "@/types/team-directory";
import type { TeamMember } from "@/types/team";
import { TEAM_ROLE_LABELS } from "@/types/team";

const ROLE_TO_DESIGNATION: Partial<Record<string, string>> = {
  super_admin: "Operations Manager",
  admin: "Brand Success Manager",
  reviewer: "Franchise Consultant",
  content_manager: "Content Manager",
  support: "Support Executive",
};

const ROLE_TO_DEPARTMENT: Partial<Record<string, string>> = {
  super_admin: "Operations",
  admin: "Brand Success",
  reviewer: "Franchise Consulting",
  content_manager: "Content",
  support: "Support",
};

export const DUMMY_TEAM_MEMBERS: TeamDirectoryMember[] = [
  {
    id: "dummy-1",
    full_name: "Priya Sharma",
    email: "priya.sharma@ifranchise.in",
    phone: "+91 98765 43210",
    role: "Operations Manager",
    department: "Operations",
    status: "active",
    joined_at: "2024-01-12T00:00:00Z",
    last_active_at: new Date(Date.now() - 2 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Platform operations", "Team coordination", "SLA monitoring"],
    source: "dummy",
  },
  {
    id: "dummy-2",
    full_name: "Rohan Mehta",
    email: "rohan.mehta@ifranchise.in",
    phone: "+91 98234 56781",
    role: "Franchise Consultant",
    department: "Franchise Consulting",
    status: "active",
    joined_at: "2024-02-03T00:00:00Z",
    last_active_at: new Date(Date.now() - 5 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Franchise onboarding", "Owner advisory", "Deal structuring"],
    source: "dummy",
  },
  {
    id: "dummy-3",
    full_name: "Ananya Iyer",
    email: "ananya.iyer@ifranchise.in",
    phone: "+91 97654 32109",
    role: "Brand Success Manager",
    department: "Brand Success",
    status: "active",
    joined_at: "2024-02-18T00:00:00Z",
    last_active_at: new Date(Date.now() - 24 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Brand health", "Retention programs", "Success reviews"],
    source: "dummy",
  },
  {
    id: "dummy-4",
    full_name: "Vikram Reddy",
    email: "vikram.reddy@ifranchise.in",
    phone: "+91 98123 45670",
    role: "Lead Manager",
    department: "Sales & CRM",
    status: "active",
    joined_at: "2024-03-05T00:00:00Z",
    last_active_at: new Date(Date.now() - 48 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Lead routing", "Pipeline hygiene", "Conversion tracking"],
    source: "dummy",
  },
  {
    id: "dummy-5",
    full_name: "Kavya Nair",
    email: "kavya.nair@ifranchise.in",
    phone: "+91 98901 23456",
    role: "Business Analyst",
    department: "Operations",
    status: "active",
    joined_at: "2024-03-22T00:00:00Z",
    last_active_at: new Date(Date.now() - 6 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Reporting", "KPI dashboards", "Process optimization"],
    source: "dummy",
  },
  {
    id: "dummy-6",
    full_name: "Arjun Patel",
    email: "arjun.patel@ifranchise.in",
    phone: "+91 98456 78901",
    role: "Marketing Manager",
    department: "Marketing",
    status: "active",
    joined_at: "2024-04-10T00:00:00Z",
    last_active_at: new Date(Date.now() - 12 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Campaign strategy", "Brand positioning", "Growth experiments"],
    source: "dummy",
  },
  {
    id: "dummy-7",
    full_name: "Sneha Desai",
    email: "sneha.desai@ifranchise.in",
    phone: "+91 98321 09876",
    role: "CRM Executive",
    department: "Sales & CRM",
    status: "active",
    joined_at: "2024-05-02T00:00:00Z",
    last_active_at: new Date(Date.now() - 3 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["CRM hygiene", "Follow-ups", "Investor communication"],
    source: "dummy",
  },
  {
    id: "dummy-8",
    full_name: "Karthik Menon",
    email: "karthik.menon@ifranchise.in",
    phone: "+91 99012 34567",
    role: "Sales Manager",
    department: "Sales & CRM",
    status: "inactive",
    joined_at: "2024-05-28T00:00:00Z",
    last_active_at: new Date(Date.now() - 14 * 24 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Regional sales", "Partner acquisition", "Revenue targets"],
    source: "dummy",
  },
  {
    id: "dummy-9",
    full_name: "Meera Joshi",
    email: "meera.joshi@ifranchise.in",
    phone: "+91 97890 12345",
    role: "Support Executive",
    department: "Support",
    status: "active",
    joined_at: "2024-06-14T00:00:00Z",
    last_active_at: new Date(Date.now() - 1 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Ticket resolution", "Owner support", "Escalation handling"],
    source: "dummy",
  },
  {
    id: "dummy-10",
    full_name: "Aditya Singh",
    email: "aditya.singh@ifranchise.in",
    phone: "+91 98654 32198",
    role: "Content Manager",
    department: "Content",
    status: "active",
    joined_at: "2024-07-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 8 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Listing copy", "Editorial calendar", "Brand storytelling"],
    source: "dummy",
  },
  {
    id: "dummy-11",
    full_name: "Divya Krishnan",
    email: "divya.krishnan@ifranchise.in",
    phone: "+91 98198 76543",
    role: "Finance Executive",
    department: "Finance",
    status: "active",
    joined_at: "2024-07-20T00:00:00Z",
    last_active_at: new Date(Date.now() - 72 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Invoicing", "Payout reconciliation", "Compliance"],
    source: "dummy",
  },
  {
    id: "dummy-12",
    full_name: "Nikhil Rao",
    email: "nikhil.rao@ifranchise.in",
    phone: "+91 98760 54321",
    role: "Partnership Manager",
    department: "Partnerships",
    status: "active",
    joined_at: "2024-08-08T00:00:00Z",
    last_active_at: new Date(Date.now() - 4 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Strategic alliances", "Broker network", "Co-marketing"],
    source: "dummy",
  },
  {
    id: "dummy-13",
    full_name: "Pooja Verma",
    email: "pooja.verma@ifranchise.in",
    phone: "+91 98401 67890",
    role: "Territory Manager",
    department: "Growth",
    status: "active",
    joined_at: "2024-09-15T00:00:00Z",
    last_active_at: new Date(Date.now() - 10 * 3_600_000).toISOString(),
    profile_image: null,
    responsibilities: ["Regional expansion", "Market mapping", "Field operations"],
    source: "dummy",
  },
  {
    id: "dummy-14",
    full_name: "Rahul Choudhary",
    email: "rahul.choudhary@ifranchise.in",
    phone: "+91 97987 65432",
    role: "Growth Manager",
    department: "Growth",
    status: "active",
    joined_at: "2024-10-01T00:00:00Z",
    last_active_at: new Date(Date.now() - 30 * 60_000).toISOString(),
    profile_image: null,
    responsibilities: ["Acquisition funnels", "Experimentation", "North-star metrics"],
    source: "dummy",
  },
];

export function mapTeamMemberToDirectory(member: TeamMember): TeamDirectoryMember {
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
  const real = supabaseMembers.map(mapTeamMemberToDirectory);
  const emails = new Set(real.map((m) => m.email.toLowerCase()));
  const dummy = DUMMY_TEAM_MEMBERS.filter(
    (d) => !emails.has(d.email.toLowerCase()),
  );
  return [...real, ...dummy];
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
