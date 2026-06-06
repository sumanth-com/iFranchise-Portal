import { PortalDashboardHome } from "@/components/dashboard/client/portal-dashboard-home";
import { getDashboardContext } from "@/lib/dashboard/context";

export default async function DashboardPage() {
  const {
    profile,
    brands,
    assetsByBrandId,
    brandsError,
    stats,
    health,
  } = await getDashboardContext();

  return (
    <PortalDashboardHome
      name={profile.full_name}
      stats={stats}
      health={health}
      brands={brands}
      assetsByBrandId={assetsByBrandId}
      loadError={brandsError}
    />
  );
}
