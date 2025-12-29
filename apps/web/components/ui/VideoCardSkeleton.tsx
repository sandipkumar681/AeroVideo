import { Skeleton } from "@/components/ui/skeleton";

export function VideoCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      {/* Thumbnail */}
      <Skeleton className="aspect-video w-full rounded-xl" />

      {/* Content */}
      <div className="space-y-2 px-1">
        {/* Title */}
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-3/4" />

        {/* Owner Info */}
        <div className="flex items-center gap-2 mt-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-2 pt-1">
          <Skeleton className="h-3 w-16" />
          <span className="text-muted-foreground">•</span>
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}
