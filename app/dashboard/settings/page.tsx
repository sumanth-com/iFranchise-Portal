import { SettingsTabs } from "@/components/dashboard/client/settings-tabs";
import { requireClient } from "@/lib/auth/session";

export default async function SettingsPage() {
  const profile = await requireClient();

  return (
    <SettingsTabs
      userId={profile.id}
      email={profile.email}
      fullName={profile.full_name}
      createdAt={profile.created_at}
    />
  );
}
