"use client";

import { CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type UploadProgressProps = {
  active: boolean;
  label?: string;
};

export function UploadProgress({
  active,
  label = "Uploading…",
}: UploadProgressProps) {
  const [percent, setPercent] = useState(0);
  const [complete, setComplete] = useState(false);
  const wasActive = useRef(false);

  useEffect(() => {
    if (!active) {
      if (wasActive.current) {
        setPercent(100);
        setComplete(true);
        const t = window.setTimeout(() => {
          setPercent(0);
          setComplete(false);
        }, 2200);
        wasActive.current = false;
        return () => window.clearTimeout(t);
      }
      return;
    }

    wasActive.current = true;
    setComplete(false);
    setPercent(8);
    const interval = window.setInterval(() => {
      setPercent((p) => {
        if (p >= 92) return p;
        return p + Math.random() * 10;
      });
    }, 260);

    return () => window.clearInterval(interval);
  }, [active]);

  if (!active && !complete) return null;

  const display = complete ? 100 : Math.min(Math.round(percent), 99);

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <span>{complete ? `${label.replace(/…$/, "")} complete ✓` : label}</span>
        <span className="inline-flex items-center gap-1 text-[#6D28D9]">
          {complete ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="text-emerald-700">Done</span>
            </>
          ) : (
            `${display}%`
          )}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            complete
              ? "bg-emerald-500"
              : "bg-gradient-to-r from-[#6D28D9] to-[#4F46E5]"
          }`}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
}
