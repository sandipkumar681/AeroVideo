import React from "react";
import { BACKEND_URL } from "@/constant";
import { IVideo } from "@aerovideo/types";
import { VideoCard } from "@/components/ui/VideoCard";

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
    return (data.data?.videos as IVideo[]) || [];
  } catch (error) {
    console.error("Error fetching videos:", error);
    return [];
  }
}

export async function HomeVideoList() {
  const videos = await getVideos();

  if (videos.length === 0) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <p className="text-lg font-medium text-muted-foreground">
          No videos found
        </p>
        <p className="text-sm text-muted-foreground">
          Check back later for new content
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video: IVideo, index) => (
        //@ts-ignore
        <VideoCard key={video._id || index} video={video} />
      ))}
    </div>
  );
}
