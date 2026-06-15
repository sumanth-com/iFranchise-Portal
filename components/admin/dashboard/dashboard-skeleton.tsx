export function DashboardSkeleton() {
  return (
    <div className="space-y-8 pb-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="space-y-5">
        <div className="h-40 rounded-2xl bg-slate-800/80" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100" />
          ))}
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className="space-y-4 xl:col-span-2">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-5">
            <div className="h-72 rounded-2xl bg-slate-100 lg:col-span-2" />
            <div className="h-72 rounded-2xl bg-slate-100 lg:col-span-3" />
          </div>
        </div>
        <div className="h-96 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
