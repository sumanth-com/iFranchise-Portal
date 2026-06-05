"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type Step = {
  id: string;
  title: string;
  description?: string;
};

type StepperProps = {
  steps: Step[];
  currentStep: number;
};

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between sm:hidden">
        <p className="text-sm font-semibold text-foreground">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="text-sm text-primary-600">{steps[currentStep]?.title}</p>
      </div>
      <ol className="hidden gap-1 sm:flex">
        {steps.map((step, index) => {
          const done = index < currentStep;
          const active = index === currentStep;

          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl text-xs font-bold transition-all",
                    done && "bg-[#6D28D9] text-white shadow-sm",
                    active &&
                      "bg-primary-100 text-primary-700 ring-2 ring-[#6D28D9] ring-offset-2",
                    !done && !active && "bg-slate-100 text-slate-400",
                  )}
                >
                  {done ? <Check className="h-4 w-4" /> : index + 1}
                </span>
                {index < steps.length - 1 ? (
                  <div className="relative mx-1 h-1 flex-1 overflow-hidden rounded-full bg-slate-100">
                    {done ? (
                      <motion.div
                        className="absolute inset-y-0 left-0 rounded-full bg-[#6D28D9]"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                      />
                    ) : null}
                  </div>
                ) : null}
              </div>
              <p
                className={cn(
                  "text-center text-[11px] font-semibold",
                  active ? "text-primary-700" : "text-slate-500",
                )}
              >
                {step.title}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
