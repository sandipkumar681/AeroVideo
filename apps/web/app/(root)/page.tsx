import React from "react";
import { BACKEND_URL } from "@/constant";
import { IVideo } from "@servicely/types";
import { VideoCard } from "@/components/ui/VideoCard";

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Explore the latest and most popular videos on AeroVideo.",
};

export const dynamic = "force-dynamic";

async function getVideos() {
  try {
    const res = await fetch(`${BACKEND_URL}/videos/published`, {
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("Failed to fetch videos:", res.statusText);
      return [];
    }
    const data = await res.json();
    // Backend now returns { videos: [...], pagination: {...} }
    return (data.data?.videos as IVideo[]) || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export default async function Page() {
  const videos = await getVideos();

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      {videos.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center text-center">
          <p className="text-lg font-medium text-muted-foreground">
            No videos found
          </p>
          <p className="text-sm text-muted-foreground">
            Check back later for new content
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video: IVideo, index) => (
            //@ts-ignore - _id might be missing in type intersection or just to be safe with strict mode if _id is not in IVideo but present in data
            <VideoCard key={video._id || index} video={video} />
          ))}
        </div>
      )}
    </main>
  );
}
