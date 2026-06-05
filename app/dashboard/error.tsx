"use client";

import { useEffect } from "react";

export default function DashboardError({
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
    <div className="mx-auto max-w-lg rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
      <h2 className="text-lg font-semibold text-red-900">
        Dashboard failed to load
      </h2>
      <p className="mt-2 text-sm text-red-800">
        We hit an error loading your dashboard. If this keeps happening, sign
        out and sign back in.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5B21B6]"
        >
          Retry
        </button>
        <a
          href="/login"
          className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
