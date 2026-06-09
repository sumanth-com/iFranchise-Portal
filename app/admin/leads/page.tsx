import { LeadsTable } from "@/components/leads/leads-table";
import { requireAdmin } from "@/lib/auth/session";
import { getAdminLeads, getLeadStats } from "@/lib/leads/queries";

export default async function AdminLeadsPage() {
  await requireAdmin();
  const [{ leads }, stats] = await Promise.all([getAdminLeads(), getLeadStats()]);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-primary-600">
          Lead management
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">
          Investor inquiries
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Leads captured from the public marketplace inquiry forms.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Total leads
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums">{stats.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            New leads
          </p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-amber-900">
            {stats.new}
          </p>
        </div>
      </div>

      <LeadsTable leads={leads} mode="admin" />
    </div>
  );
}
