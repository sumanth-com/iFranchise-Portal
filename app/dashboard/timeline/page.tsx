import { SubmissionTimeline } from "@/components/dashboard/client/submission-timeline";
import { getDashboardContext } from "@/lib/dashboard/context";
import { buildSubmissionTimeline } from "@/lib/dashboard/timeline";

export default async function TimelinePage() {
  const { brand, assets } = await getDashboardContext();
  const events = buildSubmissionTimeline(brand, assets);

  return (
    <div className="space-y-6 text-black">
      <div>
        <h2 className="text-2xl font-bold text-black sm:text-3xl">Timeline</h2>
        <p className="mt-2 text-sm text-black">
          Full history of your brand submission and review process.
        </p>
      </div>
      <SubmissionTimeline events={events} />
    </div>
  );
}
