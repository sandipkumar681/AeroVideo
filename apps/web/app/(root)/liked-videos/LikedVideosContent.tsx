"use client";

import React, { useEffect, useState } from "react";
import { getLikedVideos, LikedVideo } from "@/lib/api/likeApi";
import { VideoCard } from "@/components/ui/VideoCard";
import { Loader2, Heart, Play } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function LikedVideosContent() {
  const [likedVideos, setLikedVideos] = useState<LikedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLikedVideos = async () => {
      try {
        const data = await getLikedVideos();
        setLikedVideos(data || []);
      } catch (error: any) {
        console.error("Failed to fetch liked videos:", error);
        toast.error(error.message || "Failed to load liked videos");
      } finally {
        setLoading(false);
      }
    };
    fetchLikedVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <Heart className="absolute inset-0 m-auto h-5 w-5 text-primary/40 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-primary/10 p-2">
              <Heart className="h-6 w-6 text-primary" fill="currentColor" />
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Liked Videos
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            {likedVideos.length} video{likedVideos.length !== 1 ? "s" : ""}{" "}
            you've marked as favorite
          </p>
        </div>

        {likedVideos.length > 0 && (
          <Button
            asChild
            className="group h-12 px-6 text-base font-semibold transition-all hover:shadow-lg hover:shadow-primary/20"
          >
            <Link href={`/video/${(likedVideos[0].video as any)._id}`}>
              <Play className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
              Play All
            </Link>
          </Button>
        )}
      </div>

      {likedVideos.length === 0 ? (
        <div className="flex h-[50vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/20 p-12 text-center backdrop-blur-sm">
          <div className="mb-6 rounded-full bg-primary/5 p-8 outline-1 outline-primary/10">
            <Heart className="h-20 w-20 text-primary/20" strokeWidth={1} />
          </div>
          <h2 className="mb-3 text-3xl font-bold">No liked videos yet</h2>
          <p className="mx-auto mb-8 max-w-sm text-lg text-muted-foreground">
            Explore the platform and hit that like button on videos you enjoy!
          </p>
          <Button
            asChild
            size="lg"
            className="h-14 px-10 text-lg shadow-xl shadow-primary/10"
          >
            <Link href="/">Explore Awesome Content</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {likedVideos.map((item) => (
            <div
              key={item._id}
              className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500"
            >
              <VideoCard video={item.video} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
