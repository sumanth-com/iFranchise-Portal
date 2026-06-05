"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { useId, useState, type InputHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type PremiumInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className"> & {
  label: string;
  icon?: LucideIcon;
  error?: string;
};

export function PremiumInput({
  label,
  icon: Icon,
  error,
  type = "text",
  name,
  id,
  value,
  defaultValue,
  placeholder: _placeholder,
  onChange,
  onFocus,
  onBlur,
  ...props
}: PremiumInputProps) {
  const autoId = useId();
  const inputId = id ?? name ?? autoId;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [internalValue, setInternalValue] = useState(
    String(defaultValue ?? value ?? ""),
  );

  const currentValue = value !== undefined ? String(value) : internalValue;
  const isPassword = type === "password";
  const floated = focused || currentValue.length > 0;

  return (
    <div className="space-y-1.5">
      <motion.div
        className={cn(
          "relative rounded-[20px] border bg-white/80 backdrop-blur-sm transition-shadow duration-300",
          focused
            ? "border-[#6D28D9]/40 shadow-[0_0_0_4px_rgba(109,40,217,0.12)]"
            : "border-slate-200/80 shadow-[0_2px_12px_rgba(15,23,42,0.04)]",
          error ? "border-red-300 shadow-[0_0_0_4px_rgba(239,68,68,0.1)]" : null,
        )}
        animate={error ? { x: [0, -4, 4, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
      >
        {Icon ? (
          <Icon
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 transition-colors",
              focused ? "text-[#6D28D9]" : "text-slate-400",
            )}
          />
        ) : null}

        <label
          htmlFor={inputId}
          className={cn(
            "pointer-events-none absolute transition-all duration-200",
            Icon ? "left-12" : "left-4",
            floated
              ? "top-2.5 text-[11px] font-medium text-[#6D28D9]"
              : "top-1/2 -translate-y-1/2 text-sm text-slate-400",
          )}
        >
          {label}
        </label>

        <input
          {...props}
          id={inputId}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          defaultValue={defaultValue}
          placeholder=""
          className={cn(
            "h-[58px] w-full rounded-[20px] bg-transparent text-sm text-slate-900 outline-none",
            Icon ? "pl-12" : "pl-4",
            isPassword ? "pr-12" : "pr-4",
            floated ? "pb-1 pt-6" : "py-0",
          )}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          onChange={(e) => {
            if (value === undefined) setInternalValue(e.target.value);
            onChange?.(e);
          }}
        />

        {isPassword ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-[18px] w-[18px]" />
            ) : (
              <Eye className="h-[18px] w-[18px]" />
            )}
          </button>
        ) : null}
      </motion.div>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-1 text-xs text-red-600"
        >
          {error}
        </motion.p>
      ) : null}
    </div>
  );
}
