export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-6 text-black">
      <div className="h-48 rounded-3xl border border-neutral-200 bg-white" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl border border-neutral-200 bg-white" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 rounded-2xl border border-neutral-200 bg-white" />
        <div className="h-80 rounded-2xl border border-neutral-200 bg-white" />
      </div>
    </div>
  );
}
