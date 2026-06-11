import type { AdminBrandListItem } from "@/types/admin";
import type { LeadWithBrand } from "@/types/lead";

export type TrendPoint = { label: string; value: number };

export type MetricTrend = {
  value: number;
  previousValue: number;
  changePercent: number;
  sparkline: TrendPoint[];
};

export type DashboardHeroMetrics = {
  activeBrands: number;
  pendingReviews: number;
  totalLeads: number;
  teamMembers: number;
  monthlyGrowthPercent: number;
};

export type DashboardAnalyticsMetrics = {
  totalBrands: MetricTrend;
  approvedBrands: MetricTrend;
  pendingBrands: MetricTrend;
  rejectedBrands: MetricTrend;
  totalLeads: MetricTrend;
  activeLeads: MetricTrend;
  closedLeads: MetricTrend;
  conversionRate: MetricTrend;
  revenuePotential: MetricTrend;
  teamPerformance: MetricTrend;
};

export type ChartSeriesPoint = { label: string; value: number; [key: string]: string | number };

export type DashboardCharts = {
  leadGrowth: ChartSeriesPoint[];
  brandSubmissions: ChartSeriesPoint[];
  monthlyApprovals: ChartSeriesPoint[];
  leadFunnel: ChartSeriesPoint[];
  topCategories: ChartSeriesPoint[];
};

export type DashboardTimelineItem = {
  id: string;
  type:
    | "brand_submitted"
    | "brand_resubmitted"
    | "brand_updated"
    | "brand_approved"
    | "brand_rejected"
    | "brand_published"
    | "changes_requested"
    | "lead_received"
    | "team_invited"
    | "admin_invited"
    | "team_role_updated"
    | "admin_updated"
    | "generic";
  title: string;
  description: string;
  timestamp: string;
  actorName: string | null;
  actorEmail: string | null;
  href?: string;
};

export type DashboardInsight = {
  id: string;
  title: string;
  description: string;
  trend: "up" | "down" | "neutral";
  metric: string;
};

export type DashboardTopBrand = {
  id: string;
  name: string;
  industry: string | null;
  status: string;
  leadCount: number;
  revenueScore: number;
};

export type DashboardTeamPerformer = {
  id: string;
  name: string;
  email: string;
  actionCount: number;
  role: string | null;
};

export type DashboardHighValueLead = LeadWithBrand & {
  score: number;
};

export type DashboardPerformance = {
  topBrands: DashboardTopBrand[];
  topTeamMembers: DashboardTeamPerformer[];
  topCategories: ChartSeriesPoint[];
  highValueLeads: DashboardHighValueLead[];
};

export type AdminDashboardData = {
  hero: DashboardHeroMetrics;
  analytics: DashboardAnalyticsMetrics;
  charts: DashboardCharts;
  timeline: DashboardTimelineItem[];
  insights: DashboardInsight[];
  performance: DashboardPerformance;
  pendingQueue: AdminBrandListItem[];
  pendingTotal: number;
  error: string | null;
};
