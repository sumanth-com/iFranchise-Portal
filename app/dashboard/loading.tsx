export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse" aria-busy="true" aria-label="Loading dashboard">
      <div className="h-36 rounded-2xl bg-slate-100" />
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>
      <div className="grid gap-8 xl:grid-cols-5">
        <div className="h-96 rounded-2xl bg-slate-100 xl:col-span-3" />
        <div className="h-96 rounded-2xl bg-slate-100 xl:col-span-2" />
      </div>
    </div>
  );
}
