export default function EditBrandLoading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8">
      <div className="h-8 w-48 rounded-lg bg-slate-200" />
      <div className="h-4 w-72 rounded bg-slate-100" />
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 h-6 w-40 rounded bg-slate-200" />
        <div className="space-y-3">
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-10 rounded-xl bg-slate-100" />
          <div className="h-24 rounded-xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
