import { redirect } from "next/navigation";

import { requireClient } from "@/lib/auth/session";
import { getClientBrands } from "@/lib/brand/queries";
import { brandEditPath } from "@/types/brand";

type OnboardingRedirectProps = {
  searchParams: Promise<{ step?: string }>;
};

/** Legacy route — redirects to multi-brand edit flow. */
export default async function OnboardingRedirectPage({
  searchParams,
}: OnboardingRedirectProps) {
  const params = await searchParams;
  const step = params.step ?? "1";
  const profile = await requireClient();
  const { brands } = await getClientBrands(profile.id);

  if (brands.length === 0) {
    redirect("/dashboard/brands/new");
  }

  redirect(`${brandEditPath(brands[0].id, Number(step) || 1)}`);
}
