export default function BrandPreviewLoading() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="h-72 rounded-3xl bg-slate-100 sm:h-96" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-48 rounded-2xl bg-slate-100" />
          <div className="h-48 rounded-2xl bg-slate-100" />
        </div>
        <div className="h-64 rounded-2xl bg-slate-100" />
      </div>
    </div>
  );
}
