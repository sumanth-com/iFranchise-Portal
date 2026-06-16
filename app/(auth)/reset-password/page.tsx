import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getUser } from "@/lib/auth/session";

export default async function ResetPasswordPage() {
  const user = await getUser();

  return <ResetPasswordForm hasServerSession={Boolean(user)} />;
}
