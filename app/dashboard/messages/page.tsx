import Link from "next/link";
import { MessageSquare } from "lucide-react";

import { GlassCard } from "@/components/dashboard/client/glass-card";
import { getDashboardContext } from "@/lib/dashboard/context";
import { formatDateTime } from "@/lib/format-date";
import { brandEditPath } from "@/types/brand";

export default async function MessagesPage() {
  const { brands } = await getDashboardContext();

  const threads = brands
    .filter((b) => b.admin_feedback?.trim())
    .map((b) => ({
      id: b.id,
      brandName: b.business_name,
      status: b.status,
      message: b.admin_feedback!,
      time: b.reviewed_at ?? b.updated_at,
      href: brandEditPath(b.id),
    }))
    .sort((a, b) => {
      if (!a.time || !b.time) return 0;
      return new Date(b.time).getTime() - new Date(a.time).getTime();
    });

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[#6D28D9]">
          Inbox
        </p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          Messages
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Admin feedback and review comments on your franchise listings.
        </p>
      </div>

      <GlassCard padding="lg">
        {threads.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <MessageSquare className="h-10 w-10 text-slate-300" />
            <p className="mt-4 font-semibold text-slate-900">No messages yet</p>
            <p className="mt-1 text-sm text-slate-500">
              Admin comments will appear here after your brands are reviewed.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {threads.map((thread) => (
              <li key={thread.id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-slate-900">{thread.brandName}</p>
                    <p className="text-xs capitalize text-slate-500">
                      {thread.status.replace("_", " ")}
                    </p>
                  </div>
                  {thread.time ? (
                    <p className="text-xs text-slate-400">
                      {formatDateTime(thread.time)}
                    </p>
                  ) : null}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                  {thread.message}
                </p>
                <Link
                  href={thread.href}
                  className="mt-3 inline-block text-sm font-semibold text-[#6D28D9] hover:underline"
                >
                  View brand →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </GlassCard>
    </div>
  );
}
