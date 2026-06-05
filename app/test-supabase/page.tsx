import { createClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

type ConnectionResult =
  | {
      ok: true;
      latencyMs: number;
      projectHost: string;
    }
  | {
      ok: false;
      message: string;
      missingEnv?: string[];
    };

async function verifySupabaseConnection(): Promise<ConnectionResult> {
  const { url, publishableKey } = getSupabaseEnv();
  const missingEnv: string[] = [];

  if (!url) missingEnv.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publishableKey) missingEnv.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  if (missingEnv.length > 0) {
    return {
      ok: false,
      message: "Supabase environment variables are not configured.",
      missingEnv,
    };
  }

  try {
    const supabase = await createClient();
    const startedAt = Date.now();
    const { error } = await supabase.auth.getSession();
    const latencyMs = Date.now() - startedAt;

    if (error) {
      return {
        ok: false,
        message: error.message,
      };
    }

    return {
      ok: true,
      latencyMs,
      projectHost: new URL(url!).host,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create the Supabase client.",
    };
  }
}

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={
        ok
          ? "inline-flex rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800"
          : "inline-flex rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800"
      }
    >
      {ok ? "Connected" : "Not connected"}
    </span>
  );
}

export default async function TestSupabasePage() {
  const result = await verifySupabaseConnection();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-16">
      <div className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">
          Supabase setup
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Connection test
        </h1>
        <p className="text-zinc-600">
          This page uses the server Supabase client to call the Auth API and
          confirm your project URL and publishable key are valid.
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-medium text-zinc-900">Result</h2>
          <StatusBadge ok={result.ok} />
        </div>

        {result.ok ? (
          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
              <dt className="text-zinc-500">Message</dt>
              <dd className="text-right font-medium text-zinc-900">
                Next.js connected to Supabase successfully.
              </dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-zinc-100 pb-3">
              <dt className="text-zinc-500">Project host</dt>
              <dd className="text-right font-mono text-zinc-900">
                {result.projectHost}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-zinc-500">Auth API latency</dt>
              <dd className="text-right font-mono text-zinc-900">
                {result.latencyMs} ms
              </dd>
            </div>
          </dl>
        ) : (
          <div className="mt-6 space-y-4 text-sm">
            <p className="rounded-lg bg-red-50 px-4 py-3 text-red-800">
              {result.message}
            </p>
            {"missingEnv" in result && result.missingEnv ? (
              <ul className="list-inside list-disc text-zinc-600">
                {result.missingEnv.map((name) => (
                  <li key={name}>
                    <code className="font-mono text-zinc-900">{name}</code>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 p-6 text-sm text-zinc-600">
        <p className="font-medium text-zinc-900">Files in use</p>
        <ul className="mt-3 list-inside list-disc space-y-1">
          <li>
            <code className="font-mono">lib/supabase/server.ts</code> — Server
            Components &amp; Server Actions
          </li>
          <li>
            <code className="font-mono">lib/supabase/client.ts</code> — Client
            Components (not used on this page)
          </li>
        </ul>
      </section>
    </main>
  );
}
