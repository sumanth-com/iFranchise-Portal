import Link from "next/link";
import { redirect } from "next/navigation";

/** Legacy route — forwards to /dashboard/brands/new */
export default function CreateBrandRedirectPage() {
  redirect("/dashboard/brands/new");
}
