import { AuthExperience } from "@/components/auth/auth-experience";
import { AUTH_ERROR_CODES } from "@/lib/auth/auth-errors";
import { getSupabaseEnvStatus } from "@/lib/supabase/env";

export default function SignupPage() {
  const envStatus = getSupabaseEnvStatus();

  if (!envStatus.configured) {
    return (
      <AuthExperience
        initialTab="signup"
        pageError={envStatus.issues[0] ?? "Authentication is not configured."}
        authErrorCode={AUTH_ERROR_CODES.unavailable}
        envConfigured={false}
      />
    );
  }

  return <AuthExperience initialTab="signup" envConfigured />;
}
