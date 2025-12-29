import React, { Suspense } from "react";
import { Metadata } from "next";
import { HomeVideoList } from "@/components/HomeVideoList";
import { VideoCardSkeleton } from "@/components/ui/VideoCardSkeleton";

export const metadata: Metadata = {
  title: "Home",
  description: "Explore the latest and most popular videos on AeroVideo.",
};

export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <Suspense
        fallback={
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <VideoCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        <HomeVideoList />
      </Suspense>
    </main>
  );
}
