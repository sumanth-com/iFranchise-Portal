import { AuthExperience } from "@/components/auth/auth-experience";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";

export default function SignupPage() {
  const envStatus = getSupabaseEnvStatus();

  if (!envStatus.configured) {
    return (
      <AuthExperience
        initialTab="signup"
        noticeMessage={envStatus.issues[0] ?? "Authentication is not configured."}
        envConfigured={false}
      />
    );
  }

  return <AuthExperience initialTab="signup" envConfigured />;
}
