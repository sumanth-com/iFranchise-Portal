"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { cn } from "@/lib/utils";

type FileDropzoneProps = {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  label: string;
  hint?: string;
  onFilesSelected: (files: File[]) => void;
};

export function FileDropzone({
  accept,
  multiple,
  disabled,
  label,
  hint,
  onFilesSelected,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const applyFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    onFilesSelected(multiple ? files : files.slice(0, 1));
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        className="sr-only"
        onChange={(e) => applyFiles(e.target.files)}
      />
      <div
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
          if (disabled) return;
          applyFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-[#6D28D9] bg-[#6D28D9]/5"
            : "border-slate-200 bg-slate-50/50 hover:border-[#6D28D9]/40 hover:bg-[#6D28D9]/[0.03]",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#6D28D9]/10 text-[#6D28D9]">
          <Upload className="h-6 w-6" />
        </div>
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        {hint ? <p className="mt-1.5 text-xs text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}
