import { BrandProfileWizard } from "@/components/brand/BrandProfileWizard";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { StatCards } from "@/components/dashboard/stat-cards";
import { StatusOverview } from "@/components/dashboard/status-overview";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { getBrandAssets } from "@/lib/assets/queries";
import { requireClient } from "@/lib/auth/session";
import { getClientBrand } from "@/lib/brand/queries";
import { isBrandEditable } from "@/types/brand";

function calcProfileComplete(brand: {
  business_name: string;
  description: string | null;
  industry: string | null;
  contact_email: string | null;
} | null) {
  if (!brand) return 0;
  const fields = [
    brand.business_name,
    brand.description,
    brand.industry,
    brand.contact_email,
  ];
  const filled = fields.filter((f) => f?.trim()).length;
  return Math.round((filled / fields.length) * 100);
}

export default async function DashboardPage() {
  // Layout enforces access; second call reuses cached session from this request.
  const profile = await requireClient();

  const { brand, error: loadError } = await getClientBrand(profile.id);

  const assetsResult = brand
    ? await getBrandAssets(brand.id)
    : { assets: { logo: null, gallery: [] }, error: null };

  const editable = brand ? isBrandEditable(brand.status) : false;

  const subtitle = brand
    ? editable
      ? "You're building something great — pick up where you left off."
      : "Track your submission and published brand presence."
    : "Launch your franchise on the iFranchise marketplace in five simple steps.";

  return (
    <div className="space-y-8">
      <WelcomeCard
        name={profile.full_name}
        subtitle={subtitle}
        showCta={editable || !brand}
      />

      {loadError ? (
        <p
          className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-100"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <StatusOverview brand={brand} />

      <StatCards
        profileComplete={calcProfileComplete(brand)}
        hasLogo={Boolean(assetsResult.assets.logo)}
        galleryCount={assetsResult.assets.gallery.length}
      />

      {editable ? <QuickActions /> : null}

      <div className="grid gap-8 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <BrandProfileWizard
            brand={brand}
            loadError={loadError}
            assets={assetsResult.assets}
            assetsError={assetsResult.error}
          />
        </div>
        <div className="xl:col-span-2">
          <RecentActivity brand={brand} assets={assetsResult.assets} />
        </div>
      </div>
    </div>
  );
}
