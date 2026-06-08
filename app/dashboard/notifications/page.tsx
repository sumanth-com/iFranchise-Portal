import { NotificationsActivity } from "@/components/dashboard/client/notifications-activity";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildPortalNotifications } from "@/lib/notifications/build-portal-notifications";

export default async function NotificationsPage() {
  const { profile, brands, brandsError } = await getDashboardContext();
  const notifications = buildPortalNotifications(brands, {
    userName: profile.full_name,
    userEmail: profile.email,
  });

  return (
    <div className="space-y-4">
      {brandsError ? (
        <div
          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          role="alert"
        >
          {brandsError}
        </div>
      ) : null}
      <NotificationsActivity
        userId={profile.id}
        notifications={notifications}
      />
    </div>
  );
}
