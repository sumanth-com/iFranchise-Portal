// Middleware handles `/` — redirects unauthenticated users to /login
// and authenticated users to their dashboard. This page is a fallback only.
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login");
}
