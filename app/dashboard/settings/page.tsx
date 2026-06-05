import { LogoutButton } from "@/components/auth/logout-button";
import { GlassCard } from "@/components/dashboard/client/glass-card";
import { requireClient } from "@/lib/auth/session";
import { formatDateTime } from "@/lib/format-date";

export default async function SettingsPage() {
  const profile = await requireClient();

  return (
    <div className="space-y-6 text-black">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-black">
          Account
        </p>
        <h2 className="mt-2 text-2xl font-bold text-black sm:text-3xl">Settings</h2>
        <p className="mt-2 text-sm text-black">
          Manage your portal account and session.
        </p>
      </div>

      <GlassCard padding="lg" className="max-w-xl text-black">
        <h3 className="text-base font-semibold text-black">Profile</h3>
        <dl className="mt-6 space-y-4 text-sm">
          <Row label="Name" value={profile.full_name?.trim() || "—"} />
          <Row label="Email" value={profile.email} />
          <Row label="Role" value={profile.role} />
          <Row
            label="Member since"
            value={formatDateTime(profile.created_at) ?? "—"}
          />
        </dl>
      </GlassCard>

      <GlassCard padding="lg" className="max-w-xl text-black">
        <h3 className="text-base font-semibold text-black">Session</h3>
        <p className="mt-2 text-sm text-black">
          Sign out of the iFranchise portal on this device.
        </p>
        <div className="mt-6">
          <LogoutButton />
        </div>
      </GlassCard>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
      <dt className="text-black">{label}</dt>
      <dd className="font-medium capitalize text-black">{value}</dd>
    </div>
  );
}
