import { ActionRequired } from "@/components/dashboard/client/action-required";
import { ActivityFeed } from "@/components/dashboard/client/activity-feed";
import { BrandPreviewCard } from "@/components/dashboard/client/brand-preview-card";
import { CompletionTracker } from "@/components/dashboard/client/completion-tracker";
import { DashboardHero } from "@/components/dashboard/client/dashboard-hero";
import { HelpPanel } from "@/components/dashboard/client/help-panel";
import { MyBrandCard } from "@/components/dashboard/client/my-brand-card";
import { QuickStats } from "@/components/dashboard/client/quick-stats";
import { SubmissionTimeline } from "@/components/dashboard/client/submission-timeline";
import { buildActivityFeed } from "@/lib/dashboard/activity";
import { buildMarketplaceListing } from "@/lib/dashboard/listing-data";
import { getMissingActions } from "@/lib/dashboard/missing-actions";
import {
  computeSectionProgress,
  getOverallProgress,
} from "@/lib/dashboard/section-completion";
import { buildSubmissionTimeline } from "@/lib/dashboard/timeline";
import type { Brand } from "@/types/brand";
import type { BrandAssetsBundle } from "@/types/assets";

type DashboardHomeProps = {
  name?: string | null;
  brand: Brand | null;
  assets: BrandAssetsBundle;
  loadError?: string | null;
};

function daysSince(date: string | null | undefined): number | null {
  if (!date) return null;
  const diff = Date.now() - new Date(date).getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

export function DashboardHome({
  name,
  brand,
  assets,
  loadError,
}: DashboardHomeProps) {
  const sections = computeSectionProgress(brand, assets);
  const completion = getOverallProgress(sections);
  const listing = buildMarketplaceListing(brand, assets);
  const actions = getMissingActions(brand, assets);
  const timeline = buildSubmissionTimeline(brand, assets);
  const activity = buildActivityFeed(brand, assets);

  const assetCount =
    (assets.logo ? 1 : 0) +
    assets.gallery.length +
    assets.storePhotos.length +
    assets.productPhotos.length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {loadError ? (
        <p
          className="rounded-2xl border border-black bg-neutral-100 px-4 py-3 text-sm text-black"
          role="alert"
        >
          {loadError}
        </p>
      ) : null}

      <DashboardHero name={name} brand={brand} completion={completion} />

      <QuickStats
        completion={completion}
        assetCount={assetCount}
        documentCount={assets.documents.length}
        daysSinceUpdate={daysSince(brand?.updated_at)}
      />

      <div className="grid gap-6 xl:grid-cols-5">
        <div className="space-y-6 xl:col-span-3">
          <MyBrandCard brand={brand} assets={assets} />
          <CompletionTracker sections={sections} />
          <ActionRequired actions={actions} />
        </div>
        <div className="space-y-6 xl:col-span-2">
          <BrandPreviewCard listing={listing} />
          <SubmissionTimeline events={timeline} compact />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ActivityFeed items={activity} />
        <HelpPanel />
      </div>
    </div>
  );
}
