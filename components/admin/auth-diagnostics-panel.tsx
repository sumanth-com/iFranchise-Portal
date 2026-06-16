import type { AuthDiagnostics } from "@/lib/auth/diagnostics";

type AuthDiagnosticsPanelProps = {
  diagnostics: AuthDiagnostics;
};

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "inline-block h-2 w-2 rounded-full bg-emerald-500"
          : "inline-block h-2 w-2 rounded-full bg-amber-500"
      }
      aria-hidden
    />
  );
}

export function AuthDiagnosticsPanel({ diagnostics }: AuthDiagnosticsPanelProps) {
  const { supabase, connectivity } = diagnostics;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Auth diagnostics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Verify the active Supabase project and authentication health. No
          secrets are displayed on this page.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Environment</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Runtime</dt>
              <dd className="font-medium text-slate-900">
                {diagnostics.environment}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Vercel env</dt>
              <dd className="font-medium text-slate-900">
                {diagnostics.vercelEnv ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Site URL</dt>
              <dd className="font-medium text-slate-900">
                {diagnostics.siteUrl ?? "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Supabase</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Configured</dt>
              <dd className="flex items-center gap-2 font-medium text-slate-900">
                <StatusDot ok={supabase.configured} />
                {supabase.configured ? "Yes" : "No"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Project ref</dt>
              <dd className="font-mono text-xs font-medium text-slate-900">
                {supabase.projectRef ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">URL host</dt>
              <dd className="font-mono text-xs font-medium text-slate-900">
                {supabase.urlHost ?? "—"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Anon key</dt>
              <dd className="font-medium text-slate-900">
                {supabase.keySource ?? "missing"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Service role</dt>
              <dd className="font-medium text-slate-900">
                {supabase.serviceRoleConfigured ? "configured" : "not set"}
              </dd>
            </div>
            {diagnostics.projectRefMatch.expected ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Expected ref</dt>
                <dd className="flex items-center gap-2 font-mono text-xs font-medium text-slate-900">
                  {diagnostics.projectRefMatch.matches === false ? (
                    <StatusDot ok={false} />
                  ) : diagnostics.projectRefMatch.matches === true ? (
                    <StatusDot ok />
                  ) : null}
                  {diagnostics.projectRefMatch.expected}
                </dd>
              </div>
            ) : null}
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">
            Auth provider
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-slate-500">Email / password</dt>
              <dd className="flex items-center gap-2 font-medium text-slate-900">
                <StatusDot ok={diagnostics.authProviders.emailPassword === "available"} />
                {diagnostics.authProviders.emailPassword}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Connectivity</dt>
              <dd className="flex items-center gap-2 font-medium text-slate-900">
                <StatusDot ok={connectivity.ok} />
                {connectivity.ok ? "Healthy" : "Issue"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Response time</dt>
              <dd className="font-medium text-slate-900">
                {connectivity.latencyMs != null
                  ? `${connectivity.latencyMs} ms`
                  : "—"}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Checks</h2>
          {supabase.issues.length === 0 && connectivity.ok ? (
            <p className="mt-4 text-sm text-emerald-700">
              All configuration checks passed.
            </p>
          ) : (
            <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-600">
              {supabase.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
              {diagnostics.projectRefMatch.matches === false ? (
                <li>
                  SUPABASE_PROJECT_REF ({diagnostics.projectRefMatch.expected})
                  does not match the configured Supabase URL project ref (
                  {supabase.projectRef}).
                </li>
              ) : null}
              {!connectivity.ok && connectivity.error ? (
                <li>{connectivity.error}</li>
              ) : null}
            </ul>
          )}
          <p className="mt-4 text-xs text-slate-400">
            Last checked {new Date(diagnostics.checkedAt).toLocaleString()}
          </p>
        </section>
      </div>
    </div>
  );
}
