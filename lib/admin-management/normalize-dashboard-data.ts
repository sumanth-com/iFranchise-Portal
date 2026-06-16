import type {
  ExecutiveSummary,
  OperationsDashboardData,
  PlatformHealth,
} from "@/types/admin-operations";

export const EMPTY_EXECUTIVE_SUMMARY: ExecutiveSummary = {
  brandsUnderReview: 0,
  publishedBrands: 0,
  newLeadsToday: 0,
  activeTeamMembers: 0,
};

export const EMPTY_PLATFORM_HEALTH: PlatformHealth = {
  marketplaceStatus: "attention",
  marketplaceLabel: "Needs attention",
  storageUsagePercent: 0,
  storageLabel: "—",
  activeUsers: 0,
  responseTimeMs: null,
  responseLabel: "—",
};

const zeroKpi = { value: 0, changePercent: 0, href: "#" };

/** Ensures client components never crash on partial or stale dashboard payloads. */
export function normalizeOperationsDashboardData(
  data: Partial<OperationsDashboardData> | null | undefined,
): OperationsDashboardData {
  return {
    executiveSummary: data?.executiveSummary ?? EMPTY_EXECUTIVE_SUMMARY,
    platformHealth: data?.platformHealth ?? EMPTY_PLATFORM_HEALTH,
    kpis: data?.kpis ?? {
      totalBrands: zeroKpi,
      pendingReviews: zeroKpi,
      totalLeads: zeroKpi,
      totalAdmins: zeroKpi,
    },
    adminStats: data?.adminStats ?? {
      totalAdmins: 0,
      activeAdmins: 0,
      pendingInvitations: 0,
      suspendedAdmins: 0,
    },
    activity: data?.activity ?? [],
    pendingReviews: data?.pendingReviews ?? [],
    directory: data?.directory ?? [],
    leads: data?.leads ?? {
      newLeads: 0,
      hotLeads: 0,
      assignedLeads: 0,
      recentLeads: [],
    },
    brands: data?.brands ?? {
      draft: 0,
      approved: 0,
      published: 0,
      rejected: 0,
      chart: [],
    },
    error: data?.error ?? null,
  };
}
