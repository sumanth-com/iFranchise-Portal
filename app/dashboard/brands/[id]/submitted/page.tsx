import { BrandSubmissionSuccess } from "@/components/brand/BrandSubmissionSuccess";
import { requireClient } from "@/lib/auth/session";
import { getClientBrandById } from "@/lib/brand/queries";
import { redirect } from "next/navigation";

type SubmittedPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BrandSubmittedPage({ params }: SubmittedPageProps) {
  const { id } = await params;
  const profile = await requireClient();
  const { brand, error } = await getClientBrandById(profile.id, id);

  if (error || !brand) {
    redirect("/dashboard/brands");
  }

  if (brand.status === "draft") {
    redirect(`/dashboard/brands/${id}/edit?step=8`);
  }

  return (
    <div className="-my-6 flex min-h-[calc(100dvh-11.5rem)] items-center justify-center py-4 sm:-my-8 lg:min-h-[calc(100dvh-8.5rem)]">
      <BrandSubmissionSuccess brand={brand} />
    </div>
  );
}
