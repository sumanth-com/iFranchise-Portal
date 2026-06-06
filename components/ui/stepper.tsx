"use client";

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
  /** Hide per-step labels; show current step title below instead */
  compact?: boolean;
};

export function Stepper({ steps, currentStep, compact = false }: StepperProps) {
  const current = steps[currentStep];

  if (compact) {
    return (
      <div className="w-full">
        <div className="mb-3 flex items-center justify-between sm:hidden">
          <p className="text-sm font-semibold text-slate-900">
            Step {currentStep + 1} of {steps.length}
          </p>
          <p className="text-sm font-medium text-[#6D28D9]">{current?.title}</p>
        </div>

        {/* Even spacing: lines flex between fixed-size circles; padding prevents edge clipping */}
        <div className="px-3 sm:px-8 md:px-12">
          <div className="flex w-full items-center">
            {steps.map((step, index) => {
              const completed = index < currentStep;
              const active = index === currentStep;
              const upcoming = index > currentStep;
              const lineCompleted = index > 0 && index <= currentStep;

              return (
                <div key={step.id} className="contents">
                  {index > 0 ? (
                    <div
                      className={cn(
                        "h-0.5 min-w-[0.5rem] flex-1 rounded-full sm:h-1",
                        lineCompleted ? "bg-[#6D28D9]" : "bg-slate-200",
                      )}
                      aria-hidden
                    />
                  ) : null}

                  <span
                    className={cn(
                      "relative z-10 flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:text-xs",
                      "h-8 w-8 sm:h-9 sm:w-9",
                      completed && "bg-[#6D28D9] text-white",
                      active &&
                        "border-2 border-[#6D28D9] bg-white text-[#6D28D9]",
                      upcoming && "bg-slate-100 text-slate-400",
                    )}
                    aria-current={active ? "step" : undefined}
                    title={step.title}
                  >
                    {completed ? (
                      <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                    ) : (
                      index + 1
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 px-3 text-sm font-medium text-slate-700 sm:px-8 md:px-12">
          <span className="text-[#6D28D9]">Step {currentStep + 1}:</span>{" "}
          {current?.title}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between sm:hidden">
        <p className="text-sm font-semibold text-slate-900">
          Step {currentStep + 1} of {steps.length}
        </p>
        <p className="text-sm font-medium text-[#6D28D9]">{current?.title}</p>
      </div>

      <ol className="hidden gap-1 px-2 sm:flex sm:px-4">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const active = index === currentStep;
          const upcoming = index > currentStep;

          return (
            <li key={step.id} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                    completed && "bg-[#6D28D9] text-white",
                    active && "border-2 border-[#6D28D9] bg-white text-[#6D28D9]",
                    upcoming && "bg-slate-100 text-slate-400",
                  )}
                  aria-current={active ? "step" : undefined}
                >
                  {completed ? (
                    <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
                  ) : (
                    index + 1
                  )}
                </span>

                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      "mx-1 h-1 flex-1 rounded-full",
                      completed ? "bg-[#6D28D9]" : "bg-slate-200",
                    )}
                    aria-hidden
                  />
                ) : null}
              </div>

              <p
                className={cn(
                  "text-center text-[11px] font-semibold",
                  active && "text-[#6D28D9]",
                  completed && "text-slate-700",
                  upcoming && "text-slate-400",
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
