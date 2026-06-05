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
    <div className="mx-auto max-w-lg rounded-2xl border border-black bg-white p-8 text-center text-black">
      <h2 className="text-lg font-semibold text-black">
        Dashboard failed to load
      </h2>
      <p className="mt-2 text-sm text-black">
        We hit an error loading your dashboard. If this keeps happening, sign
        out and sign back in.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl border border-black bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Retry
        </button>
        <a
          href="/login"
          className="rounded-xl border border-black bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-neutral-100"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
