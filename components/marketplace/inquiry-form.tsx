"use client";

import { useActionState } from "react";

import { AuthAlert } from "@/components/auth/auth-alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitLeadInquiry } from "@/lib/leads/actions";
import { initialLeadActionState } from "@/types/lead";

type InquiryFormProps = {
  brandId: string;
  brandName: string;
};

export function InquiryForm({ brandId, brandName }: InquiryFormProps) {
  const [state, action, pending] = useActionState(
    submitLeadInquiry,
    initialLeadActionState,
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">Request information</h3>
      <p className="mt-1 text-sm text-slate-500">
        Interested in {brandName}? Send an inquiry and the brand team will contact you.
      </p>

      <div className="mt-4" aria-live="polite">
        <AuthAlert error={state.error} message={state.message} />
      </div>

      <form action={action} className="mt-6 space-y-4">
        <input type="hidden" name="brandId" value={brandId} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lead-name">Full name</Label>
            <Input id="lead-name" name="name" required disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-email">Email</Label>
            <Input
              id="lead-email"
              name="email"
              type="email"
              required
              disabled={pending}
            />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lead-phone">Phone</Label>
            <Input id="lead-phone" name="phone" type="tel" disabled={pending} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lead-city">Preferred city</Label>
            <Input id="lead-city" name="city" disabled={pending} />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lead-message">Message</Label>
          <Textarea
            id="lead-message"
            name="message"
            rows={4}
            placeholder="Tell us about your investment capacity and timeline..."
            disabled={pending}
          />
        </div>
        <Button type="submit" disabled={pending} className="w-full sm:w-auto">
          {pending ? "Sending..." : "Submit inquiry"}
        </Button>
      </form>
    </div>
  );
}
