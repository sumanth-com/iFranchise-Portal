export default function NewBrandLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-slate-200" />
        <div className="h-8 w-48 rounded bg-slate-200" />
        <div className="h-4 w-full max-w-lg rounded bg-slate-100" />
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        <div className="h-2 w-full rounded-full bg-slate-100" />
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100" />
          <div className="h-12 rounded-xl bg-slate-100 sm:col-span-2" />
        </div>
      </div>
    </div>
  );
}
