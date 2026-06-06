import { redirect } from "next/navigation";

/** Legacy route — timeline is on the dashboard home. */
export default function TimelineRedirectPage() {
  redirect("/dashboard");
}
