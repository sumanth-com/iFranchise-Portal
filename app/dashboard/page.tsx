import { DashboardHome } from "@/components/dashboard/client/dashboard-home";
import { getDashboardContext } from "@/lib/dashboard/context";

export default async function DashboardPage() {
  const { profile, brand, assets, brandError } = await getDashboardContext();

  return (
    <DashboardHome
      name={profile.full_name}
      brand={brand}
      assets={assets}
      loadError={brandError}
    />
  );
}
