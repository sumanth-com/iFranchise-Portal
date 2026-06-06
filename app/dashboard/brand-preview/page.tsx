import { redirect } from "next/navigation";

/** Legacy route — redirects to marketplace preview hub. */
export default function BrandPreviewRedirectPage() {
  redirect("/dashboard/marketplace-preview");
}
