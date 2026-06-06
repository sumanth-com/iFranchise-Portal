import { ProfileForm } from "@/components/dashboard/client/profile-form";
import { requireClient } from "@/lib/auth/session";

export default async function ProfilePage() {
  const profile = await requireClient();

  return (
    <ProfileForm
      userId={profile.id}
      email={profile.email}
      fullName={profile.full_name}
    />
  );
}
