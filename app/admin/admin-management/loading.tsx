import { Skeleton } from "@/components/ui/skeleton";

export default function AdminManagementLoading() {
  return (
    <div className="space-y-6 pb-8">
      <Skeleton className="h-36 rounded-2xl" />
      <div className="grid gap-6 xl:grid-cols-5">
        <Skeleton className="h-80 rounded-2xl xl:col-span-2" />
        <Skeleton className="h-[28rem] rounded-2xl xl:col-span-3" />
      </div>
    </div>
  );
}
