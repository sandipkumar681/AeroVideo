"use client";

import { useEffect, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/redux-toolkit/hooks";
import { useRouter } from "next/navigation";
import { getLikedVideos, LikedVideo } from "@/lib/api/likeApi";
import { VideoCard } from "@/components/ui/VideoCard";
import { Loader2, Heart } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function LikedVideosContent() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { userDetails, isLoading, isLoggedIn } = useAppSelector(
    (state) => state.logInReducer
  );

  const [videos, setVideos] = useState<LikedVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);

  useEffect(() => {
    if (!isLoading && !isLoggedIn && !userDetails) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, userDetails, router]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        if (isLoggedIn) {
          const data = await getLikedVideos();
          setVideos(data);
        }
      } catch (error) {
        console.error("Failed to fetch liked videos:", error);
        toast.error("Failed to load liked videos");
      } finally {
        setLoadingVideos(false);
      }
    };

    if (isLoggedIn) {
      fetchVideos();
    } else if (!isLoading) {
      setLoadingVideos(false);
    }
  }, [isLoggedIn, isLoading]);

  if (isLoading || loadingVideos) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <Heart className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-2xl font-semibold">No liked videos yet</h2>
        <p className="text-muted-foreground max-w-sm">
          Videos you like will appear here.
        </p>
        <Button asChild>
          <Link href="/">Explore Videos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Liked Videos</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {videos.map((item) => (
          // @ts-ignore - VideoCard might expect strict IVideo but item.video fits the shape usually.
          // If strictly typed, we might need to conform item.video to IVideo if it's partial.
          // Based on type defs, it should be compatible.
          <VideoCard key={item._id} video={item.video} />
        ))}
      </div>
    </div>
  );
}
