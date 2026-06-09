import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { requireStaff } from "@/lib/auth/session";

export default async function AdminAccessDeniedPage() {
  await requireStaff();

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card padding="lg" className="max-w-md text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="mt-6 text-xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-slate-500">
          This area is restricted to Super Admins. Contact your platform administrator
          if you need elevated access.
        </p>
        <Link
          href="/admin"
          className="mt-6 inline-flex rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
        >
          Back to dashboard
        </Link>
      </Card>
    </div>
  );
}
