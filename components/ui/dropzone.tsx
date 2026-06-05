"use client";

import { motion } from "framer-motion";
import { Upload } from "lucide-react";
import { useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type DropzoneProps = {
  name: string;
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  required?: boolean;
  label: string;
  hint?: string;
  children?: ReactNode;
};

export function Dropzone({
  name,
  accept,
  multiple,
  disabled,
  required,
  label,
  hint,
  children,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        multiple={multiple}
        required={required}
        disabled={disabled}
        className="sr-only"
      />
      <motion.div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onClick={() => !disabled && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (disabled || !inputRef.current) return;
          const dt = new DataTransfer();
          Array.from(e.dataTransfer.files).forEach((f) => dt.items.add(f));
          inputRef.current.files = dt.files;
        }}
        whileHover={disabled ? undefined : { scale: 1.01 }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-[var(--radius-card)] border-2 border-dashed px-6 py-12 text-center transition-all",
          dragging
            ? "border-[#6D28D9] bg-primary-50 shadow-[var(--shadow-focus)]"
            : "border-primary-200 bg-surface hover:border-primary-400 hover:bg-primary-50/30",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-primary-600">
          <Upload className="h-7 w-7" />
        </div>
        <p className="text-sm font-semibold text-foreground">{label}</p>
        {hint ? <p className="mt-2 text-xs text-slate-500">{hint}</p> : null}
      </motion.div>
      {children}
    </div>
  );
}
