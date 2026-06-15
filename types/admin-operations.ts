import type { AdminBrandListItem } from "@/types/admin";
import type { AdminDirectoryRow } from "@/types/admin-command-center";
import type { LeadWithBrand } from "@/types/lead";

export type OperationsKpi = {
  value: number;
  changePercent: number;
  href: string;
};

export type OperationsActivityItem = {
  id: string;
  type:
    | "brand_submitted"
    | "brand_approved"
    | "brand_rejected"
    | "brand_published"
    | "lead_received"
    | "admin_invited"
    | "admin_created";
  title: string;
  description: string;
  timestamp: string;
  href?: string;
};

export type LeadIntelligence = {
  newLeads: number;
  hotLeads: number;
  assignedLeads: number;
  recentLeads: LeadWithBrand[];
};

export type BrandPerformance = {
  draft: number;
  approved: number;
  published: number;
  rejected: number;
  chart: { label: string; value: number; color: string }[];
};

export type OperationsDashboardData = {
  kpis: {
    totalBrands: OperationsKpi;
    pendingReviews: OperationsKpi;
    totalLeads: OperationsKpi;
    totalAdmins: OperationsKpi;
  };
  adminStats: {
    totalAdmins: number;
    activeAdmins: number;
    pendingInvitations: number;
    suspendedAdmins: number;
  };
  activity: OperationsActivityItem[];
  pendingReviews: AdminBrandListItem[];
  directory: AdminDirectoryRow[];
  leads: LeadIntelligence;
  brands: BrandPerformance;
  error: string | null;
};
