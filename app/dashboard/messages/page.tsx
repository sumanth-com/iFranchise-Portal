import { redirect } from "next/navigation";

/** Legacy route — messages live in Notifications. */
export default function MessagesRedirectPage() {
  redirect("/dashboard/notifications");
}
