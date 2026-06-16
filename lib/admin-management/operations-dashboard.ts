import { buildAdminActivityFeed } from "@/lib/admin/activity-feed";
import { getAdminBrands, getAdminDashboardStats } from "@/lib/admin/queries";
import {
  getAdminAccounts,
  getAdminInvitations,
  getAdminManagementActivity,
} from "@/lib/admin-management/queries";
import { resolveDisplayRole } from "@/lib/admin-management/permissions-display";
import { getAdminLeads } from "@/lib/leads/queries";
import { verifySupabaseConnectivity } from "@/lib/supabase/connectivity";
import { createClient } from "@/lib/supabase/server";
import type { AdminDirectoryRow } from "@/types/admin-command-center";
import type {
  OperationsActivityItem,
  OperationsDashboardData,
  PlatformHealth,
} from "@/types/admin-operations";

const STORAGE_QUOTA_BYTES = 50 * 1024 * 1024 * 1024;

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

function formatStorageLabel(totalBytes: number): string {
  const percent = Math.min(
    100,
    Math.round((totalBytes / STORAGE_QUOTA_BYTES) * 100),
  );
  if (totalBytes < 1024 * 1024 * 1024) {
    const mb = Math.round(totalBytes / (1024 * 1024));
    return `${mb} MB (${percent}%)`;
  }
  const gb = (totalBytes / (1024 * 1024 * 1024)).toFixed(1);
  return `${gb} GB (${percent}%)`;
}

function formatResponseLabel(latencyMs: number | null): string {
  if (latencyMs === null) return "—";
  if (latencyMs < 1000) return `${latencyMs} ms`;
  return `${(latencyMs / 1000).toFixed(1)} s`;
}
function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function trendFromDates(dates: (string | null | undefined)[]): number {
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
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function buildDirectoryRows(): Promise<{
  rows: AdminDirectoryRow[];
  error: string | null;
}> {
  return (async () => {
    const [{ admins, error }, { invitations }] = await Promise.all([
      getAdminAccounts(),
      getAdminInvitations(),
    ]);

    if (error) return { rows: [], error };

    const rows: AdminDirectoryRow[] = admins.map((admin) => {
      const { displayRole, label } = resolveDisplayRole(
        admin.role,
        admin.team_role,
      );
      return {
        id: admin.id,
        email: admin.email,
        full_name: admin.full_name,
        phone: admin.phone,
        portalRole: admin.role,
        teamRole: admin.team_role,
        displayRole,
        displayRoleLabel: label,
        status: admin.is_active ? "active" : "suspended",
        isInvitation: false,
        invitationId: null,
        is_active: admin.is_active,
        created_at: admin.created_at,
        lastSignInAt: admin.last_login_at,
      };
    });

    for (const inv of invitations) {
      const portalRole =
        inv.team_role === "super_admin" ? "super_admin" : "admin";
      const { displayRole, label } = resolveDisplayRole(
        portalRole,
        inv.team_role,
      );
      rows.push({
        id: `inv-${inv.id}`,
        email: inv.email,
        full_name: null,
        phone: null,
        portalRole,
        teamRole: inv.team_role,
        displayRole,
        displayRoleLabel: label,
        status: "pending",
        isInvitation: true,
        invitationId: inv.id,
        is_active: false,
        created_at: inv.created_at,
        lastSignInAt: null,
      });
    }

    rows.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );

    return { rows, error: null };
  })();
}

function mergeActivity(
  brandFeed: ReturnType<typeof buildAdminActivityFeed>,
  logs: Awaited<ReturnType<typeof getAdminManagementActivity>>["logs"],
  leads: { id: string; name: string; brand_name: string; created_at: string }[],
): OperationsActivityItem[] {
  const items: OperationsActivityItem[] = [];

  for (const item of brandFeed) {
    let type: OperationsActivityItem["type"] = "brand_submitted";
    let title = "Brand submitted";

    if (item.type === "brand_approved") {
      type = "brand_approved";
      title = "Brand approved";
    } else if (item.type === "brand_published") {
      type = "brand_published";
      title = "Brand published";
    } else if (
      item.type === "brand_submitted" ||
      item.type === "brand_resubmitted"
    ) {
      type = "brand_submitted";
      title =
        item.type === "brand_resubmitted"
          ? "Brand resubmitted"
          : "Brand submitted";
    } else if (item.type === "brand_rejected") {
      continue;
    }

    if (!item.timestamp) continue;

    items.push({
      id: item.id,
      type,
      title,
      description: item.description,
      timestamp: item.timestamp,
      href: `/admin/brands/${item.brandId}`,
    });
  }

  for (const log of logs) {
    if (log.action.startsWith("bootstrap.")) {
      continue;
    }

    const meta = log.metadata ?? {};
    const email = typeof meta.email === "string" ? meta.email : null;

    if (log.action === "admin.invited" || log.action === "team.invite") {
      items.push({
        id: log.id,
        type: "team_member_added",
        title: "Team member added",
        description: email
          ? `${email} was invited to join the team`
          : "A new team member was invited",
        timestamp: log.created_at,
        href: "/admin/team",
      });
    } else if (log.action === "admin.enabled") {
      items.push({
        id: log.id,
        type: "team_member_added",
        title: "Team member added",
        description: email
          ? `${email} joined the operations team`
          : "A team member was activated",
        timestamp: log.created_at,
        href: "/admin/team",
      });
    } else if (log.action === "admin.welcome_notification") {
      items.push({
        id: log.id,
        type: "notification_sent",
        title: "Notification sent",
        description: email
          ? `Welcome message delivered to ${email}`
          : "A platform notification was sent",
        timestamp: log.created_at,
        href: "/admin/notifications",
      });
    } else if (
      log.action === "brand.approved" ||
      log.action === "brand.published"
    ) {
      items.push({
        id: log.id,
        type:
          log.action === "brand.published"
            ? "brand_published"
            : "brand_approved",
        title:
          log.action === "brand.published"
            ? "Brand published"
            : "Brand approved",
        description:
          typeof meta.businessName === "string"
            ? meta.businessName
            : "Brand review decision recorded",
        timestamp: log.created_at,
        href: log.entity_id ? `/admin/brands/${log.entity_id}` : undefined,
      });
    }
  }

  for (const lead of leads.slice(0, 20)) {
    items.push({
      id: `lead-${lead.id}`,
      type: "lead_received",
      title: "Lead received",
      description: `${lead.name} inquired about ${lead.brand_name}`,
      timestamp: lead.created_at,
      href: "/admin/leads",
    });
  }

  return items
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    )
    .slice(0, 20);
}

export async function getOperationsDashboardData(): Promise<OperationsDashboardData> {
  const supabase = await createClient();

  const [
    { stats, error: statsError },
    { brands: pendingBrands },
    { leads, error: leadsError },
    { rows: directory },
    { logs },
    brandsStatusResult,
    activityBrandsResult,
    storageResult,
    activeUsersResult,
    connectivity,
  ] = await Promise.all([
    getAdminDashboardStats(),
    getAdminBrands({ pendingOnly: true, pageSize: 6 }),
    getAdminLeads(),
    buildDirectoryRows(),
    getAdminManagementActivity(),
    supabase.from("brands").select("status, created_at, submitted_at, published_at"),
    supabase
      .from("brands")
      .select(
        "id, business_name, status, created_at, updated_at, submitted_at, reviewed_at, published_at",
      )
      .order("updated_at", { ascending: false })
      .limit(40),
    supabase.from("brand_assets").select("file_size"),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true),
    verifySupabaseConnectivity(),
  ]);

  if (statsError) {
    return emptyDashboard(statsError);
  }

  const brandRows = brandsStatusResult.data ?? [];
  const brandDates = brandRows.map((b) => b.created_at);
  const pendingDates = brandRows
    .filter((b) => b.status === "submitted")
    .map((b) => b.submitted_at ?? b.created_at);
  const leadDates = leads.map((l) => l.created_at);
  const adminDates = directory
    .filter((d) => !d.isInvitation)
    .map((d) => d.created_at);

  const draft = brandRows.filter((b) => b.status === "draft").length;
  const approved = brandRows.filter(
    (b) => b.status === "approved" && !b.published_at,
  ).length;
  const published = stats.publishedBrands;
  const rejected = stats.rejectedBrands;

  const brandFeed = buildAdminActivityFeed(
    (activityBrandsResult.data ?? []) as Parameters<
      typeof buildAdminActivityFeed
    >[0],
  );

  const sevenDaysAgo = Date.now() - 7 * 86_400_000;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const hotLeads = leads.filter(
    (l) =>
      (l.status === "new" || l.status === "qualified") &&
      new Date(l.created_at).getTime() >= sevenDaysAgo,
  ).length;
  const assignedLeads = leads.filter(
    (l) => l.status === "contacted" || l.status === "qualified",
  ).length;

  const activeAdmins = directory.filter(
    (d) => !d.isInvitation && d.status === "active",
  ).length;
  const pendingInvitations = directory.filter((d) => d.isInvitation).length;
  const suspendedAdmins = directory.filter(
    (d) => !d.isInvitation && d.status === "suspended",
  ).length;

  const newLeadsToday = leads.filter((l) => isToday(l.created_at)).length;
  const totalStorageBytes = (storageResult.data ?? []).reduce(
    (sum, row) => sum + (row.file_size ?? 0),
    0,
  );
  const storageUsagePercent = Math.min(
    100,
    Math.round((totalStorageBytes / STORAGE_QUOTA_BYTES) * 100),
  );

  const platformHealth: PlatformHealth = {
    marketplaceStatus:
      statsError || !connectivity.ok ? "attention" : "healthy",
    marketplaceLabel:
      statsError || !connectivity.ok ? "Needs attention" : "Healthy",
    storageUsagePercent,
    storageLabel: formatStorageLabel(totalStorageBytes),
    activeUsers: activeUsersResult.count ?? activeAdmins + stats.totalBrandOwners,
    responseTimeMs: connectivity.latencyMs,
    responseLabel: formatResponseLabel(connectivity.latencyMs),
  };

  return {
    executiveSummary: {
      brandsUnderReview: stats.pendingReviews,
      publishedBrands: stats.publishedBrands,
      newLeadsToday,
      activeTeamMembers: activeAdmins,
    },
    platformHealth,
    kpis: {
      totalBrands: {
        value: stats.totalBrands,
        changePercent: trendFromDates(brandDates),
        href: "/admin/brands",
      },
      pendingReviews: {
        value: stats.pendingReviews,
        changePercent: trendFromDates(pendingDates),
        href: "/admin/reviews",
      },
      totalLeads: {
        value: leads.length,
        changePercent: trendFromDates(leadDates),
        href: "/admin/leads",
      },
      totalAdmins: {
        value: directory.filter((d) => !d.isInvitation).length,
        changePercent: trendFromDates(adminDates),
        href: "#admins",
      },
    },
    adminStats: {
      totalAdmins: directory.filter((d) => !d.isInvitation).length,
      activeAdmins,
      pendingInvitations,
      suspendedAdmins,
    },
    activity: mergeActivity(brandFeed, logs, leads),
    pendingReviews: pendingBrands,
    directory,
    leads: {
      newLeads,
      hotLeads,
      assignedLeads,
      recentLeads: leads.slice(0, 6),
    },
    brands: {
      draft,
      approved,
      published,
      rejected,
      chart: [
        { label: "Draft", value: draft, color: "#94A3B8" },
        { label: "Approved", value: approved, color: "#7C3AED" },
        { label: "Published", value: published, color: "#059669" },
        { label: "Rejected", value: rejected, color: "#E11D48" },
      ],
    },
    error: leadsError,
  };
}

function emptyDashboard(error: string): OperationsDashboardData {
  const zero = { value: 0, changePercent: 0, href: "#" };
  return {
    executiveSummary: {
      brandsUnderReview: 0,
      publishedBrands: 0,
      newLeadsToday: 0,
      activeTeamMembers: 0,
    },
    platformHealth: {
      marketplaceStatus: "attention",
      marketplaceLabel: "Needs attention",
      storageUsagePercent: 0,
      storageLabel: "—",
      activeUsers: 0,
      responseTimeMs: null,
      responseLabel: "—",
    },
    kpis: {
      totalBrands: zero,
      pendingReviews: zero,
      totalLeads: zero,
      totalAdmins: zero,
    },
    adminStats: {
      totalAdmins: 0,
      activeAdmins: 0,
      pendingInvitations: 0,
      suspendedAdmins: 0,
    },
    activity: [],
    pendingReviews: [],
    directory: [],
    leads: { newLeads: 0, hotLeads: 0, assignedLeads: 0, recentLeads: [] },
    brands: {
      draft: 0,
      approved: 0,
      published: 0,
      rejected: 0,
      chart: [],
    },
    error,
  };
}
