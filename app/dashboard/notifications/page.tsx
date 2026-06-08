import { NotificationsActivity } from "@/components/dashboard/client/notifications-activity";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildPortalNotifications } from "@/lib/notifications/build-portal-notifications";

export default async function NotificationsPage() {
  const { profile, brands } = await getDashboardContext();
  const notifications = buildPortalNotifications(brands);

  return (
    <NotificationsActivity
      userId={profile.id}
      notifications={notifications}
    />
  );
}
