export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-10 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-64 rounded-3xl bg-slate-200/80" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-36 rounded-2xl bg-slate-100" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 rounded-2xl bg-slate-100" />
        <div className="h-72 rounded-2xl bg-slate-100" />
      </div>
      <div className="h-80 rounded-2xl bg-slate-100" />
    </div>
  );
}
