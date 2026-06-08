import { MessagesInbox } from "@/components/dashboard/client/messages-inbox";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildMessageThreads } from "@/lib/messages/build-message-threads";

export default async function MessagesPage() {
  const { profile, brands } = await getDashboardContext();
  const threads = buildMessageThreads(brands);

  return <MessagesInbox userId={profile.id} threads={threads} />;
}
