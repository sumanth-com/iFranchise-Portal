import { redirect } from "next/navigation";

import { isDevAutoLoginEnabled } from "@/lib/auth/dev-credentials";

export default function DevAdminLoginPage() {
  if (!isDevAutoLoginEnabled()) {
    redirect("/login");
  }

  redirect("/dev-login");
}
