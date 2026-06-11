// Middleware handles `/` — redirects unauthenticated users to login (or dev auto-login)
// and authenticated users to their dashboard. This page is a fallback only.
import { redirect } from "next/navigation";

import { isDevAutoLoginEnabled } from "@/lib/auth/dev-credentials";

export default function Home() {
  redirect(isDevAutoLoginEnabled() ? "/dev-login" : "/login");
}
