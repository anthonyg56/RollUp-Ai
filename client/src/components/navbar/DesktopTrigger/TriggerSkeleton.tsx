import { Skeleton } from "@/components/ui/skeleton";

export default function TriggerSkeleton() {
  return (
    <>
      <Skeleton className="h-10 w-[110px]" />
      <Skeleton className="h-8 w-8 rounded-full" />
    </>
  )
}
