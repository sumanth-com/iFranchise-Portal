export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse" aria-busy="true" aria-label="Loading admin">
      <div className="h-10 w-48 rounded-lg bg-slate-100" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100" />
        ))}
      </div>
    </div>
  );
}
