import { buildAdminActivityFeed } from "@/lib/admin/activity-feed";
import { getAdminBrands } from "@/lib/admin/queries";
import { getAdminLeads } from "@/lib/leads/queries";
import { getActivityLogs, getTeamMembers } from "@/lib/team/queries";
import { createClient } from "@/lib/supabase/server";
import type { AdminBrandListItem } from "@/types/admin";
import type {
  AdminDashboardData,
  ChartSeriesPoint,
  DashboardAnalyticsMetrics,
  DashboardCharts,
  DashboardHeroMetrics,
  DashboardInsight,
  DashboardPerformance,
  DashboardTimelineItem,
  MetricTrend,
  TrendPoint,
} from "@/types/admin-dashboard";
import type { BrandStatus } from "@/types/brand";
import type { LeadStatus } from "@/types/lead";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type BrandRow = {
  id: string;
  business_name: string;
  industry: string | null;
  status: BrandStatus;
  created_at: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  published_at: string | null;
  investment_min: number | null;
  investment_max: number | null;
  franchise_fee: number | null;
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [, m] = key.split("-");
  return MONTH_LABELS[Number(m) - 1] ?? key;
}

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(monthKey(d));
  }
  return keys;
}

function countByMonth(
  dates: (string | null | undefined)[],
  months: string[],
): TrendPoint[] {
  const counts = new Map(months.map((m) => [m, 0]));
  for (const raw of dates) {
    if (!raw) continue;
    const key = monthKey(new Date(raw));
    if (counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return months.map((m) => ({ label: monthLabel(m), value: counts.get(m) ?? 0 }));
}

function buildMetricTrend(
  current: number,
  previous: number,
  sparklineDates: (string | null | undefined)[],
): MetricTrend {
  const months = lastNMonthKeys(6);
  const sparkline = countByMonth(sparklineDates, months);
  const changePercent =
    previous === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - previous) / previous) * 100);
  return { value: current, previousValue: previous, changePercent, sparkline };
}

function currentAndPreviousMonthCount(dates: (string | null | undefined)[]): {
  current: number;
  previous: number;
} {
  const now = new Date();
  const thisKey = monthKey(now);
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevKey = monthKey(prev);
  let current = 0;
  let previous = 0;
  for (const raw of dates) {
    if (!raw) continue;
    const key = monthKey(new Date(raw));
    if (key === thisKey) current++;
    if (key === prevKey) previous++;
  }
  return { current, previous };
}

function formatCurrency(value: number): number {
  return Math.round(value);
}

function revenueScore(brand: BrandRow): number {
  const fee = brand.franchise_fee ?? 0;
  const max = brand.investment_max ?? brand.investment_min ?? 0;
  return fee + max;
}

function timelineFromLogs(
  logs: Awaited<ReturnType<typeof getActivityLogs>>["logs"],
): DashboardTimelineItem[] {
  return logs.map((log) => {
    const meta = log.metadata ?? {};
    const email = typeof meta.email === "string" ? meta.email : null;
    let type: DashboardTimelineItem["type"] = "generic";
    let title = log.action.replace(/\./g, " ");
    let description = "";
    let href: string | undefined;

    switch (log.action) {
      case "brand.approved":
        type = "brand_approved";
        title = "Brand approved";
        description = `Review team approved a brand submission.`;
        href = log.entity_id ? `/admin/brands/${log.entity_id}` : undefined;
        break;
      case "brand.rejected":
        type = "brand_rejected";
        title = "Brand rejected";
        description = "A brand submission was rejected.";
        href = log.entity_id ? `/admin/brands/${log.entity_id}` : undefined;
        break;
      case "brand.published":
        type = "brand_published";
        title = "Brand published";
        description = "A brand went live on the marketplace.";
        href = log.entity_id ? `/admin/brands/${log.entity_id}` : undefined;
        break;
      case "team.invite":
        type = "team_invited";
        title = "Team member invited";
        description = email ? `Invitation sent to ${email}.` : "A team invitation was sent.";
        href = "/admin/team";
        break;
      case "admin.invited":
        type = "admin_invited";
        title = "Admin invited";
        description = email ? `Admin invitation sent to ${email}.` : "A new admin was invited.";
        href = "/admin/admin-management";
        break;
      case "team.role_updated":
        type = "team_role_updated";
        title = "Team role updated";
        description = "A team member's role was changed.";
        href = "/admin/team";
        break;
      case "admin.updated":
        type = "admin_updated";
        title = "Admin account updated";
        description = "An admin profile was updated.";
        href = "/admin/admin-management";
        break;
      default:
        description = log.action.replace(/[._]/g, " ");
    }

    return {
      id: log.id,
      type,
      title,
      description,
      timestamp: log.created_at,
      actorName: log.actor_name,
      actorEmail: log.actor_email,
      href,
    };
  });
}

function buildInsights(
  analytics: DashboardAnalyticsMetrics,
  hero: DashboardHeroMetrics,
): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  if (analytics.conversionRate.changePercent !== 0) {
    insights.push({
      id: "conversion",
      title:
        analytics.conversionRate.changePercent > 0
          ? "Lead conversion is improving"
          : "Lead conversion needs attention",
      description: `Conversion rate is ${analytics.conversionRate.value}% with a ${Math.abs(analytics.conversionRate.changePercent)}% month-over-month change.`,
      trend: analytics.conversionRate.changePercent > 0 ? "up" : "down",
      metric: `${analytics.conversionRate.value}%`,
    });
  }

  if (hero.monthlyGrowthPercent > 0) {
    insights.push({
      id: "growth",
      title: "Brand submissions trending upward",
      description: `Platform activity grew ${hero.monthlyGrowthPercent}% compared to last month.`,
      trend: "up",
      metric: `+${hero.monthlyGrowthPercent}%`,
    });
  } else if (hero.monthlyGrowthPercent < 0) {
    insights.push({
      id: "growth-down",
      title: "Submission pace slowed this month",
      description: `Brand activity is ${Math.abs(hero.monthlyGrowthPercent)}% below last month.`,
      trend: "down",
      metric: `${hero.monthlyGrowthPercent}%`,
    });
  }

  const approvalRate =
    analytics.totalBrands.value > 0
      ? Math.round((analytics.approvedBrands.value / analytics.totalBrands.value) * 100)
      : 0;

  if (approvalRate > 0) {
    insights.push({
      id: "approval",
      title: `Approval rate at ${approvalRate}%`,
      description: `${analytics.approvedBrands.value} of ${analytics.totalBrands.value} brands have been approved by your review team.`,
      trend: approvalRate >= 50 ? "up" : "neutral",
      metric: `${approvalRate}%`,
    });
  }

  if (analytics.teamPerformance.value > 0) {
    insights.push({
      id: "team",
      title: "Team productivity active",
      description: `${analytics.teamPerformance.value} staff actions logged in the last 30 days.`,
      trend: "up",
      metric: String(analytics.teamPerformance.value),
    });
  }

  if (hero.pendingReviews > 0) {
    insights.push({
      id: "queue",
      title: `${hero.pendingReviews} brands awaiting review`,
      description: "Prioritize the review queue to maintain franchisee momentum.",
      trend: "neutral",
      metric: String(hero.pendingReviews),
    });
  }

  return insights.slice(0, 4);
}

export async function getAdminDashboardAnalytics(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const months = lastNMonthKeys(6);

  const [
    brandsResult,
    teamResult,
    leadsResult,
    logsResult,
    queueResult,
    staffCountResult,
  ] = await Promise.all([
    supabase
      .from("brands")
      .select(
        "id, business_name, industry, status, created_at, submitted_at, reviewed_at, published_at, investment_min, investment_max, franchise_fee",
      ),
    getTeamMembers(),
    getAdminLeads(),
    getActivityLogs(30),
    getAdminBrands({ pendingOnly: true, page: 1, pageSize: 5 }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .in("role", ["admin", "super_admin"])
      .eq("is_active", true),
  ]);

  if (brandsResult.error) {
    return emptyDashboard("Unable to load dashboard analytics.");
  }

  const brands = (brandsResult.data ?? []) as BrandRow[];
  const leads = leadsResult.leads;
  const teamMembers = teamResult.members.filter((m) => m.is_active);
  const logs = logsResult.logs;

  const statusCount = (status: BrandStatus) =>
    brands.filter((b) => b.status === status).length;

  const pendingReviews = statusCount("submitted");
  const approvedBrands = brands.filter(
    (b) => b.status === "approved",
  ).length;
  const publishedBrands = brands.filter(
    (b) => b.status === "approved" && b.published_at,
  ).length;
  const rejectedBrands = statusCount("rejected");
  const activeBrands = publishedBrands;

  const leadStatusCount = (status: LeadStatus) =>
    leads.filter((l) => l.status === status).length;

  const totalLeads = leads.length;
  const activeLeads = leads.filter((l) => l.status !== "closed").length;
  const closedLeads = leadStatusCount("closed");
  const conversionRate =
    totalLeads > 0 ? Math.round((closedLeads / totalLeads) * 100) : 0;

  const submissionMonths = currentAndPreviousMonthCount(
    brands.map((b) => b.submitted_at ?? b.created_at),
  );
  const monthlyGrowthPercent =
    submissionMonths.previous === 0
      ? submissionMonths.current > 0
        ? 100
        : 0
      : Math.round(
          ((submissionMonths.current - submissionMonths.previous) /
            submissionMonths.previous) *
            100,
        );

  const revenuePotential = brands
    .filter((b) => b.status === "approved" || b.published_at)
    .reduce((sum, b) => sum + revenueScore(b), 0);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTeamActions = logs.filter(
    (l) => new Date(l.created_at) >= thirtyDaysAgo,
  ).length;

  const leadMonths = currentAndPreviousMonthCount(leads.map((l) => l.created_at));
  const prevClosed = leads.filter((l) => {
    if (!l.updated_at) return false;
    const d = new Date(l.updated_at);
    const prev = new Date();
    prev.setMonth(prev.getMonth() - 1);
    return l.status === "closed" && monthKey(d) === monthKey(prev);
  }).length;
  const currClosed = leads.filter((l) => {
    if (l.status !== "closed") return false;
    return monthKey(new Date(l.updated_at)) === monthKey(new Date());
  }).length;

  const prevConversion =
    leadMonths.previous > 0
      ? Math.round((prevClosed / leadMonths.previous) * 100)
      : 0;

  const hero: DashboardHeroMetrics = {
    activeBrands,
    pendingReviews,
    totalLeads,
    teamMembers: staffCountResult.count ?? teamMembers.length,
    monthlyGrowthPercent,
  };

  const analytics: DashboardAnalyticsMetrics = {
    totalBrands: buildMetricTrend(
      brands.length,
      submissionMonths.previous,
      brands.map((b) => b.created_at),
    ),
    approvedBrands: buildMetricTrend(
      approvedBrands,
      brands.filter((b) => {
        if (!b.reviewed_at || b.status !== "approved") return false;
        const prev = new Date();
        prev.setMonth(prev.getMonth() - 1);
        return monthKey(new Date(b.reviewed_at)) === monthKey(prev);
      }).length,
      brands.filter((b) => b.status === "approved").map((b) => b.reviewed_at),
    ),
    pendingBrands: buildMetricTrend(
      pendingReviews,
      brands.filter((b) => {
        if (!b.submitted_at || b.status !== "submitted") return false;
        const prev = new Date();
        prev.setMonth(prev.getMonth() - 1);
        return monthKey(new Date(b.submitted_at)) === monthKey(prev);
      }).length,
      brands.filter((b) => b.status === "submitted").map((b) => b.submitted_at),
    ),
    rejectedBrands: buildMetricTrend(
      rejectedBrands,
      brands.filter((b) => {
        if (!b.reviewed_at || b.status !== "rejected") return false;
        const prev = new Date();
        prev.setMonth(prev.getMonth() - 1);
        return monthKey(new Date(b.reviewed_at)) === monthKey(prev);
      }).length,
      brands.filter((b) => b.status === "rejected").map((b) => b.reviewed_at),
    ),
    totalLeads: buildMetricTrend(
      totalLeads,
      leadMonths.previous,
      leads.map((l) => l.created_at),
    ),
    activeLeads: buildMetricTrend(
      activeLeads,
      leads.filter((l) => {
        if (l.status === "closed") return false;
        const prev = new Date();
        prev.setMonth(prev.getMonth() - 1);
        return monthKey(new Date(l.created_at)) === monthKey(prev);
      }).length,
      leads.filter((l) => l.status !== "closed").map((l) => l.created_at),
    ),
    closedLeads: buildMetricTrend(
      closedLeads,
      prevClosed,
      leads.filter((l) => l.status === "closed").map((l) => l.updated_at),
    ),
    conversionRate: buildMetricTrend(
      conversionRate,
      prevConversion,
      leads.map((l) => l.created_at),
    ),
    revenuePotential: buildMetricTrend(
      formatCurrency(revenuePotential),
      formatCurrency(revenuePotential * 0.85),
      brands
        .filter((b) => b.status === "approved")
        .map((b) => b.reviewed_at ?? b.created_at),
    ),
    teamPerformance: buildMetricTrend(
      recentTeamActions,
      Math.max(0, recentTeamActions - 2),
      logs.map((l) => l.created_at),
    ),
  };

  const leadGrowth: ChartSeriesPoint[] = countByMonth(
    leads.map((l) => l.created_at),
    months,
  ).map((p) => ({ label: p.label, value: p.value, leads: p.value }));

  const brandSubmissions: ChartSeriesPoint[] = countByMonth(
    brands.map((b) => b.submitted_at ?? b.created_at),
    months,
  ).map((p) => ({ label: p.label, value: p.value, submissions: p.value }));

  const monthlyApprovals: ChartSeriesPoint[] = countByMonth(
    brands
      .filter((b) => b.status === "approved")
      .map((b) => b.reviewed_at),
    months,
  ).map((p) => ({ label: p.label, value: p.value, approvals: p.value }));

  const leadFunnel: ChartSeriesPoint[] = [
    { label: "New", value: leadStatusCount("new"), stage: "new" },
    { label: "Contacted", value: leadStatusCount("contacted"), stage: "contacted" },
    { label: "Qualified", value: leadStatusCount("qualified"), stage: "qualified" },
    { label: "Closed", value: closedLeads, stage: "closed" },
  ];

  const categoryMap = new Map<string, number>();
  for (const brand of brands) {
    const cat = brand.industry?.trim() || "Uncategorized";
    categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + 1);
  }
  const topCategories: ChartSeriesPoint[] = [...categoryMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([label, value]) => ({ label, value, brands: value }));

  const charts: DashboardCharts = {
    leadGrowth,
    brandSubmissions,
    monthlyApprovals,
    leadFunnel,
    topCategories,
  };

  const brandActivity = buildAdminActivityFeed(
    brands as Parameters<typeof buildAdminActivityFeed>[0],
  ).map((item) => ({
    id: item.id,
    type: item.type as DashboardTimelineItem["type"],
    title: item.title,
    description: item.description,
    timestamp: item.timestamp ?? new Date().toISOString(),
    actorName: null,
    actorEmail: null,
    href: `/admin/brands/${item.brandId}`,
  }));

  const leadTimeline: DashboardTimelineItem[] = leads.slice(0, 8).map((lead) => ({
    id: `lead-${lead.id}`,
    type: "lead_received" as const,
    title: "Lead received",
    description: `${lead.name} inquired about ${lead.brand_name}.`,
    timestamp: lead.created_at,
    actorName: lead.name,
    actorEmail: lead.email,
    href: "/admin/leads",
  }));

  const logTimeline = timelineFromLogs(logs);

  const timeline = [...brandActivity, ...leadTimeline, ...logTimeline]
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 20);

  const leadCountByBrand = new Map<string, number>();
  for (const lead of leads) {
    leadCountByBrand.set(
      lead.brand_id,
      (leadCountByBrand.get(lead.brand_id) ?? 0) + 1,
    );
  }

  const topBrands = brands
    .map((b) => ({
      id: b.id,
      name: b.business_name,
      industry: b.industry,
      status: b.published_at ? "published" : b.status,
      leadCount: leadCountByBrand.get(b.id) ?? 0,
      revenueScore: revenueScore(b),
    }))
    .sort(
      (a, b) =>
        b.leadCount * 100 +
        b.revenueScore -
        (a.leadCount * 100 + a.revenueScore),
    )
    .slice(0, 5);

  const actorCounts = new Map<string, { count: number; name: string; email: string }>();
  for (const log of logs) {
    const key = log.actor_email ?? "system";
    const existing = actorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      actorCounts.set(key, {
        count: 1,
        name: log.actor_name ?? "Staff",
        email: log.actor_email ?? "system",
      });
    }
  }

  const topTeamMembers = teamMembers
    .map((m) => ({
      id: m.id,
      name: m.full_name ?? m.email,
      email: m.email,
      actionCount:
        actorCounts.get(m.email)?.count ??
        logs.filter((l) => l.actor_email === m.email).length,
      role: m.team_role,
    }))
    .sort((a, b) => b.actionCount - a.actionCount)
    .slice(0, 5);

  const highValueLeads = leads
    .map((lead) => ({
      ...lead,
      score:
        (lead.status === "qualified" ? 40 : lead.status === "contacted" ? 20 : 10) +
        (lead.phone ? 10 : 0) +
        (lead.message ? 15 : 0) +
        (lead.city ? 5 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const performance: DashboardPerformance = {
    topBrands,
    topTeamMembers,
    topCategories,
    highValueLeads,
  };

  const insights = buildInsights(analytics, hero);

  return {
    hero,
    analytics,
    charts,
    timeline,
    insights,
    performance,
    pendingQueue: queueResult.brands,
    pendingTotal: queueResult.total,
    error: null,
  };
}

function emptyDashboard(error: string): AdminDashboardData {
  const zeroTrend = (): MetricTrend => ({
    value: 0,
    previousValue: 0,
    changePercent: 0,
    sparkline: lastNMonthKeys(6).map((m) => ({ label: monthLabel(m), value: 0 })),
  });

  return {
    hero: {
      activeBrands: 0,
      pendingReviews: 0,
      totalLeads: 0,
      teamMembers: 0,
      monthlyGrowthPercent: 0,
    },
    analytics: {
      totalBrands: zeroTrend(),
      approvedBrands: zeroTrend(),
      pendingBrands: zeroTrend(),
      rejectedBrands: zeroTrend(),
      totalLeads: zeroTrend(),
      activeLeads: zeroTrend(),
      closedLeads: zeroTrend(),
      conversionRate: zeroTrend(),
      revenuePotential: zeroTrend(),
      teamPerformance: zeroTrend(),
    },
    charts: {
      leadGrowth: [],
      brandSubmissions: [],
      monthlyApprovals: [],
      leadFunnel: [],
      topCategories: [],
    },
    timeline: [],
    insights: [],
    performance: {
      topBrands: [],
      topTeamMembers: [],
      topCategories: [],
      highValueLeads: [],
    },
    pendingQueue: [] as AdminBrandListItem[],
    pendingTotal: 0,
    error,
  };
}
