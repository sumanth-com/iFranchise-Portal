"use client";

import { useEffect } from "react";

export default function EditBrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[brand edit]", error);
  }, [error]);

  const isUploadLimit =
    error.message?.includes("Body exceeded") ||
    error.message?.includes("Unexpected end of form") ||
    error.message?.includes("413");

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">
        {isUploadLimit ? "Upload failed" : "Unable to load brand editor"}
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        {isUploadLimit
          ? "File upload failed. PDF max 20MB; images max 5MB each. Try again with a smaller file."
          : "Something went wrong while loading your brand. Your saved data is usually still safe — try again."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={() => reset()}
          className="rounded-xl bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white hover:bg-[#5B21B6]"
        >
          Try again
        </button>
        <a
          href="/dashboard/brands"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          My Brands
        </a>
      </div>
    </div>
  );
}
