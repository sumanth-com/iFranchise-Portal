"use client";

type OperationsAdminStatsProps = {
  stats: {
    totalAdmins: number;
    activeAdmins: number;
    pendingInvitations: number;
    suspendedAdmins: number;
  };
};

const cards = [
  { key: "totalAdmins" as const, label: "Total admins" },
  { key: "activeAdmins" as const, label: "Active admins" },
  { key: "pendingInvitations" as const, label: "Pending invitations" },
  { key: "suspendedAdmins" as const, label: "Suspended admins" },
];

export function OperationsAdminStats({ stats }: OperationsAdminStatsProps) {
  return (
    <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-slate-200/90 bg-white px-4 py-3.5 shadow-sm"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {card.label}
          </p>
          <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">
            {stats[card.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
