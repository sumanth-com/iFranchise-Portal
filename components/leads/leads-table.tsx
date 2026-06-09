"use client";

import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { formatDateTime } from "@/lib/format-date";
import {
  updateLeadStatus,
  updateOwnerLeadStatus,
} from "@/lib/leads/actions";
import type { LeadWithBrand } from "@/types/lead";
import {
  initialLeadActionState,
  LEAD_STATUS_LABELS,
  type LeadStatus,
} from "@/types/lead";

const STATUS_OPTIONS: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "closed",
];

type LeadsTableProps = {
  leads: LeadWithBrand[];
  mode: "admin" | "owner";
};

export function LeadsTable({ leads, mode }: LeadsTableProps) {
  const action = mode === "admin" ? updateLeadStatus : updateOwnerLeadStatus;
  const [state, formAction, pending] = useActionState(
    action,
    initialLeadActionState,
  );

  if (leads.length === 0) {
    return (
      <p className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No leads yet. Published brands will capture inquiries from the marketplace.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div aria-live="polite">
        <AuthAlert error={state.error} message={state.message} />
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Lead
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Brand
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                City
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Date
              </th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-slate-50/50">
                <td className="px-4 py-3.5">
                  <p className="font-medium text-slate-900">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                  {lead.phone ? (
                    <p className="text-xs text-slate-500">{lead.phone}</p>
                  ) : null}
                  {lead.message ? (
                    <p className="mt-1 line-clamp-2 text-xs text-slate-400">
                      {lead.message}
                    </p>
                  ) : null}
                </td>
                <td className="px-4 py-3.5 text-slate-600">{lead.brand_name}</td>
                <td className="px-4 py-3.5 text-slate-500">{lead.city ?? "—"}</td>
                <td className="px-4 py-3.5 text-slate-500">
                  {formatDateTime(lead.created_at)}
                </td>
                <td className="px-4 py-3.5">
                  <form action={formAction} className="flex items-center gap-2">
                    <input type="hidden" name="leadId" value={lead.id} />
                    <select
                      name="status"
                      defaultValue={lead.status}
                      disabled={pending}
                      onChange={(e) => e.currentTarget.form?.requestSubmit()}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-medium"
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {LEAD_STATUS_LABELS[s]}
                        </option>
                      ))}
                    </select>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
