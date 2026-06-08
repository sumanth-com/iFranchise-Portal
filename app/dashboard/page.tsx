import type { DashboardKpis } from "@/components/dashboard/client/dashboard/kpi-grid";
import { computeBrandPortfolioStats } from "@/lib/dashboard/brand-stats";
import { buildPortfolioHealth } from "@/lib/dashboard/brand-health";
import { PortalDashboardHome } from "@/components/dashboard/client/portal-dashboard-home";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildDashboardActivity } from "@/lib/dashboard/activity-feed";
import { buildPortfolioTimeline } from "@/lib/dashboard/portfolio-timeline";
import { getPortfolioReviewStage } from "@/lib/dashboard/review-stage";
import { buildPortalNotifications } from "@/lib/notifications/build-portal-notifications";

export default async function DashboardPage() {
  const {
    profile,
    brands,
    assetsByBrandId,
    brandsError,
    assetsError,
    stats,
    health,
    brand,
  } = await getDashboardContext();

  const notifications = buildPortalNotifications(brands, {
    userName: profile.full_name,
    userEmail: profile.email,
  });
  const activities = buildDashboardActivity(brands, assetsByBrandId);
  const timeline = buildPortfolioTimeline(brands, assetsByBrandId);
  const { label: reviewLabel, stages: reviewStages } =
    getPortfolioReviewStage(brands);

  const portfolioStats = stats ?? computeBrandPortfolioStats(brands);
  const portfolioHealth = health ?? buildPortfolioHealth(brands, assetsByBrandId);

  const kpis: DashboardKpis = {
    totalBrands: portfolioStats.total,
    activeListings: portfolioStats.approved + portfolioStats.underReview,
    notifications: notifications.length,
    underReview: portfolioStats.underReview,
    futureLeads: null,
  };

  return (
    <PortalDashboardHome
      userId={profile.id}
      email={profile.email}
      name={profile.full_name}
      kpis={kpis}
      reviewLabel={reviewLabel}
      reviewStages={reviewStages}
      activities={activities}
      health={portfolioHealth}
      brandName={brand?.business_name}
      timeline={timeline}
      loadError={brandsError ?? assetsError}
    />
  );
}
