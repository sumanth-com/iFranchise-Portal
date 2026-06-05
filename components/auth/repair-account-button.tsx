"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { repairAccount } from "@/lib/auth/actions";
import { initialAuthActionState } from "@/types/auth";

type RepairAccountButtonProps = {
  redirectTo?: string | null;
};

export function RepairAccountButton({ redirectTo }: RepairAccountButtonProps) {
  const [state, action, pending] = useActionState(
    repairAccount,
    initialAuthActionState,
  );

  return (
    <form action={action} className="flex flex-col items-center gap-2">
      {redirectTo ? (
        <input type="hidden" name="redirectTo" value={redirectTo} />
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-[46px] rounded-[16px] bg-[#6D28D9] px-8 shadow-[0_18px_50px_rgba(109,40,217,0.25)] hover:bg-[#5B21B6]"
      >
        {pending ? "Repairing account..." : "Try again"}
      </Button>
      {state.error ? (
        <p className="max-w-sm text-center text-xs text-red-600" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
