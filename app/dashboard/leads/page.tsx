import { LeadsTable } from "@/components/leads/leads-table";
import { PortalPageHeader } from "@/components/dashboard/client/portal-page-header";
import { requireClient } from "@/lib/auth/session";
import { getClientLeads } from "@/lib/leads/queries";

export default async function DashboardLeadsPage() {
  const profile = await requireClient();
  const { leads, error } = await getClientLeads(profile.id);

  return (
    <div className="space-y-8">
      <PortalPageHeader
        eyebrow="Investor inquiries"
        title="Leads"
        description="Inquiries from your published marketplace listings."
      />

      {error ? (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      <LeadsTable leads={leads} mode="owner" />
    </div>
  );
}
