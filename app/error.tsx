"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-white px-6 text-center">
      <h1 className="text-2xl font-semibold text-slate-900">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The page could not load. This is usually temporary — try again, or
        return to the login page.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#5B21B6]"
        >
          Try again
        </button>
        <a
          href="/login"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Go to login
        </a>
      </div>
    </div>
  );
}
