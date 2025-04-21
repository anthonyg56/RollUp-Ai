import { Skeleton } from "@/components/ui/skeleton";

export default function TriggerSkeleton() {
  return (
    <div className="flex items-center justify-between w-full px-4">
      <Skeleton className="h-8 w-[100px]" />
      <Skeleton className="h-6 w-6 rounded-sm" />
    </div>
  )
}
